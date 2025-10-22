from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pymysql
import os
import random
import re
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from dotenv import load_dotenv

# -----------------------------
# Configuración inicial
# -----------------------------
load_dotenv()
app = Flask(__name__)
app.secret_key = "arrozconpollo"  


CORS(app,
     supports_credentials=True,
     origins=["http://127.0.0.1:5502", "http://localhost:5502"])

# Configuración de correo
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = ('Sistema de FAQS', 'no-responder@dulcearte.co')
mail = Mail(app)


# Funciones auxiliares

def get_connection():
    return pymysql.connect(host='localhost', user='root', passwd='', db='dulcearte')

def generar_token_numerico():
    return '-'.join([str(random.randint(100, 999)) for _ in range(3)])

def obtener_ubicacion(ip):
    try:
        res = requests.get(f'https://ipapi.co/{ip}/json/')
        if res.status_code == 200:
            d = res.json()
            return f"{d.get('city', 'Desconocida')}, {d.get('region', 'Desconocida')}, {d.get('country_name', 'Desconocido')}"
        return "Ubicación no disponible"
    except Exception as e:
        print("Error al obtener ubicación:", e)
        return "Ubicación no disponible"


# Registro

@app.route('/registro', methods=['POST'])
def registro():
    data = request.json
    correo = data.get('correo', '').strip().lower()
    contrasena = data.get('contrasena', '').strip()

    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', correo):
        return jsonify({"status": "error", "mensaje": "Formato de correo inválido"}), 400
    if not correo.endswith(('@iegabo.edu.co', '@gmail.com', '@hotmail.com')):
        return jsonify({"status": "error", "mensaje": "Correo no permitido"}), 400
    if len(contrasena) < 6:
        return jsonify({"status": "error", "mensaje": "La contraseña debe tener al menos 6 caracteres"}), 400

    contrasena_cifrada = generate_password_hash(contrasena)

    conexion, cursor = None, None
    try:
        conexion = get_connection()
        cursor = conexion.cursor()
        cursor.execute("INSERT INTO usuarios (correo, contrasena) VALUES (%s, %s)", (correo, contrasena_cifrada))
        conexion.commit()
        usuario_id = cursor.lastrowid
        cursor.execute("INSERT INTO datos_usuario (usuario_id) VALUES (%s)", (usuario_id,))
        conexion.commit()

        # Enviar correo de bienvenida
        html = render_template('registro.html', correo=correo)
        mail.send(Message(subject="Registro exitoso en DulceArte", recipients=[correo], html=html))

        return jsonify({"status": "ok", "mensaje": "Usuario registrado correctamente"})

    except pymysql.err.IntegrityError:
        return jsonify({"status": "error", "mensaje": "Correo ya registrado"}), 400
    except Exception as e:
        if conexion: conexion.rollback()
        return jsonify({"status": "error", "mensaje": f"Error interno: {str(e)}"}), 500
    finally:
        if cursor: cursor.close() if cursor else None
        if conexion: conexion.close() if conexion else None


# Login 

@app.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    correo = data.get('correo', '').strip().lower()
    contrasena = data.get('contrasena', '').strip()

    if not correo or not contrasena:
        return jsonify({"status": "error", "mensaje": "Correo y contraseña son obligatorios"}), 400

    conexion, cursor = None, None
    try:
        conexion = get_connection()
        cursor = conexion.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT id, correo, contrasena FROM usuarios WHERE correo = %s", (correo,))
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"status": "error", "mensaje": "Correo no registrado"}), 401
        if not check_password_hash(usuario["contrasena"], contrasena):
            return jsonify({"status": "error", "mensaje": "Contraseña incorrecta"}), 401

        # Obtener datos completos
        cursor.execute("""SELECT nombre, apellido, documento, tipo_documento, direccion, celular
                          FROM datos_usuario WHERE usuario_id=%s""", (usuario['id'],))
        datos = cursor.fetchone() or {}
        usuario_completo = {**usuario, **datos}

        
        return jsonify({"status": "ok", "usuario": usuario_completo})

    except Exception as e:
        return jsonify({"status": "error", "mensaje": f"Error interno: {str(e)}"}), 500
    finally:
        if cursor: cursor.close() if cursor else None
        if conexion: conexion.close() if conexion else None




# -----------------------------
# Perfil 
# -----------------------------

# Perfil 
# -----------------------------
# -----------------------------
# OBTENER PERFIL
# -----------------------------
@app.route('/perfil/<int:usuario_id>', methods=['GET'])
def obtener_perfil(usuario_id):
    conexion, cursor = None, None
    try:
        conexion = get_connection()
        cursor = conexion.cursor(pymysql.cursors.DictCursor)

        cursor.execute("SELECT id, correo FROM usuarios WHERE id=%s", (usuario_id,))
        usuario = cursor.fetchone()
        if not usuario:
            return jsonify({"status": "error", "mensaje": "Usuario no encontrado"}), 404

        cursor.execute("""SELECT nombre, apellido, documento, tipo_documento, direccion, celular
                          FROM datos_usuario WHERE usuario_id=%s""", (usuario_id,))
        datos = cursor.fetchone() or {}

        usuario_completo = {**usuario, **datos}
        return jsonify({"status": "ok", "usuario": usuario_completo})
    except Exception as e:
        return jsonify({"status": "error", "mensaje": f"Error: {e}"}), 500
    finally:
        if cursor: cursor.close()
        if conexion: conexion.close()


# -----------------------------
# ACTUALIZAR PERFIL
# -----------------------------
@app.route('/perfil/actualizar', methods=['POST'])
def actualizar_perfil():
    data = request.json or {}
    usuario_id = data.get('usuario_id')
    if not usuario_id:
        return jsonify({"status": "error", "mensaje": "Falta usuario_id"}), 401

    conexion, cursor = None, None
    try:
        conexion = get_connection()
        cursor = conexion.cursor()

        # Actualizar contraseña si se envía
        if data.get("contrasena"):
            cursor.execute("UPDATE usuarios SET contrasena=%s WHERE id=%s",
                           (generate_password_hash(data["contrasena"]), usuario_id))

        # Actualizar otros campos
        campos, valores = [], []
        for campo in ["nombre", "apellido", "documento", "tipo_documento", "direccion", "celular"]:
            if data.get(campo) is not None:
                campos.append(f"{campo}=%s")
                valores.append(data[campo])

        if campos:
            sql = f"UPDATE datos_usuario SET {', '.join(campos)} WHERE usuario_id=%s"
            valores.append(usuario_id)
            cursor.execute(sql, tuple(valores))

        conexion.commit()
        return jsonify({"status": "ok", "mensaje": "Perfil actualizado correctamente"})

    except Exception as e:
        if conexion: conexion.rollback()
        return jsonify({"status": "error", "mensaje": f"Error: {e}"}), 500
    finally:
        if cursor: cursor.close()
        if conexion: conexion.close()


# -----------------------------
# VERIFICAR SESIÓN (manejo)
# -----------------------------
@app.route('/validar_usuario', methods=['POST'])
def validar_usuario():
    data = request.json
    usuario_id = data.get('usuario_id')

    conexion = get_connection()
    cursor = conexion.cursor()

    try:
        cursor.execute("SELECT id FROM usuarios WHERE id = %s", (usuario_id,))
        usuario = cursor.fetchone()

        if usuario:
            return jsonify({"status": "ok", "mensaje": "Usuario válido"})
        else:
            return jsonify({"status": "error", "mensaje": "Usuario inválido"}), 401

    except Exception as e:
        return jsonify({"status": "error", "mensaje": f"Error en validación: {str(e)}"}), 500
    finally:
        cursor.close()
        conexion.close()




# -----------------------------
# Productos
# -----------------------------
@app.route('/productos', methods=['GET'])
def obtener_productos():
    try:
        conexion = get_connection()
        cursor = conexion.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT * FROM productos")
        productos = cursor.fetchall()
        return jsonify({"status": "ok", "productos": productos})
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 500
    finally:
        if cursor: cursor.close() if cursor else None
        if conexion: conexion.close() if conexion else None

@app.route('/producto/<int:producto_id>', methods=['GET'])
def obtener_producto(producto_id):
    try:
        conexion = get_connection()
        cursor = conexion.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT * FROM productos WHERE id=%s", (producto_id,))
        producto = cursor.fetchone()
        if not producto:
            return jsonify({"status": "error", "mensaje": "Producto no encontrado"}), 404
        cursor.execute("SELECT * FROM decoraciones WHERE activo>0")
        decoraciones = cursor.fetchall()
        return jsonify({"status": "ok", "producto": producto, "decoraciones": decoraciones})
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 500
    finally:
        if cursor: cursor.close() if cursor else None
        if conexion: conexion.close() if conexion else None

# -----------------------------
# Carrito
# -----------------------------
@app.route('/api/carrito', methods=['POST'])
def guardar_carrito():
    """Guardar carrito, frontend debe enviar 'usuario_id' y carrito"""
    data = request.json or {}
    usuario_id = data.get('usuario_id')
    carrito = data.get('carrito', [])
    if not usuario_id:
        return jsonify({"status": "error", "mensaje": "Debe enviar usuario_id"}), 401

    conexion, cursor = None, None
    try:
        conexion = get_connection()
        cursor = conexion.cursor()
        cursor.execute("DELETE FROM carrito WHERE usuario_id=%s", (usuario_id,))
        for item in carrito:
            cursor.execute("""INSERT INTO carrito
                              (usuario_id, id_producto, nombre, precio, imagen, cantidad, stock)
                              VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                           (usuario_id,
                            item.get('id'),
                            item.get('nombre'),
                            item.get('precio'),
                            item.get('imagen'),
                            item.get('cantidad'),
                            item.get('stock', 1)))
        conexion.commit()
        return jsonify({"status": "ok", "mensaje": "Carrito guardado correctamente"})
    except Exception as e:
        if conexion: conexion.rollback()
        return jsonify({"status": "error", "mensaje": str(e)}), 500
    finally:
        if cursor: cursor.close() if cursor else None
        if conexion: conexion.close() if conexion else None

@app.route('/api/carrito', methods=['GET'])
def obtener_carrito():
    """Frontend debe enviar 'usuario_id' como query param"""
    usuario_id = request.args.get('usuario_id')
    if not usuario_id:
        return jsonify({"status": "ok", "carrito": []})
    conexion, cursor = None, None
    try:
        conexion = get_connection()
        cursor = conexion.cursor(pymysql.cursors.DictCursor)
        cursor.execute("""SELECT id, nombre, precio, imagen, cantidad, stock
                          FROM carrito WHERE usuario_id=%s""", (usuario_id,))
        carrito = cursor.fetchall()
        return jsonify({"status": "ok", "carrito": carrito})
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 500
    finally:
        if cursor: cursor.close() if cursor else None
        if conexion: conexion.close() if conexion else None


if __name__ == '__main__':
    app.run(debug=True)
