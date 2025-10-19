from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
import pymysql
import os
import hashlib
from flask_mail import Mail, Message
from datetime import datetime, timedelta
import secrets
from dotenv import load_dotenv
import random
from flask import render_template
import requests
import re
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
#from sqlalchemy import create_engine
#engine = create_engine("mysql+pymysql://root:@localhost/votaciones", pool_size=10, max_overflow=20)
def obtener_ubicacion(ip):
    try:
        response = requests.get(f'https://ipapi.co/{ip}/json/')
        if response.status_code == 200:
            datos = response.json()
            ciudad = datos.get('city', 'Desconocida')
            region = datos.get('region', 'Desconocida')
            pais = datos.get('country_name', 'Desconocido')
            return f"{ciudad}, {region}, {pais}"
        else:
            return "Ubicación no disponible"
    except Exception as e:
        print("Error al obtener ubicación:", e)
        return "Ubicación no disponible"



load_dotenv()





app = Flask(__name__, template_folder='../templates')


app.secret_key = "arrozconpollo"

CORS(app)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_DEFAULT_SENDER'] = ('Sistema de FAQS', 'no-responder@dulcearte.co')
admin_email = os.getenv('ADMIN_EMAIL')

mail = Mail(app)


def generar_token_numerico():
    bloques = [str(random.randint(100, 999)) for _ in range(3)]
    return '-'.join(bloques)

token = generar_token_numerico()

def get_connection():
    return pymysql.connect(host='localhost', user='root', passwd='', db='dulcearte')



@app.route('/registro', methods=['POST'])
def registro():
    data = request.json
    correo = data.get('correo', '').strip().lower()
    contrasena = data.get('contrasena', '').strip()

    # Validaciones
    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', correo):
        return jsonify({"status": "error", "mensaje": "Formato de correo inválido"}), 400

    if not correo.endswith(('@iegabo.edu.co', '@gmail.com', '@hotmail.com')):
        return jsonify({"status": "error", "mensaje": "Correo no permitido"}), 400

    if len(contrasena) < 6:
        return jsonify({"status": "error", "mensaje": "La contraseña debe tener al menos 6 caracteres"}), 400

    contrasena_cifrada = generate_password_hash(contrasena)

    conexion = None
    cursor = None

    try:
        conexion = get_connection()
        cursor = conexion.cursor()
        cursor.execute("INSERT INTO usuarios (correo, contrasena) VALUES (%s, %s)", (correo, contrasena_cifrada))
        conexion.commit()

        # Enviar correo de bienvenida
        html = render_template('registro.html', correo=correo)
        mensaje = Message(subject="Registro exitoso en DulceArte", recipients=[correo], html=html)
        mail.send(mensaje)

        print(f"[Registro] Usuario creado: {correo}")
        return jsonify({"status": "ok", "mensaje": "Usuario registrado correctamente"})

    except pymysql.err.IntegrityError:
        return jsonify({"status": "error", "mensaje": "Correo ya registrado"}), 400
    except Exception as e:
        if conexion: conexion.rollback()
        return jsonify({"status": "error", "mensaje": f"Error interno: {str(e)}"}), 500
    finally:
        if cursor: cursor.close()
        if conexion: conexion.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    correo = data.get('correo', '').strip().lower()
    contrasena = data.get('contrasena', '').strip()

    # Validaciones básicas
    if not correo or not contrasena:
        return jsonify({"status": "error", "mensaje": "Correo y contraseña son obligatorios"}), 400

    conexion = None
    cursor = None

    try:
        conexion = get_connection()
        cursor = conexion.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT id, correo, contrasena FROM usuarios WHERE correo = %s", (correo,))
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"status": "error", "mensaje": "Correo no registrado"}), 401

        # Verificar contraseña cifrada
        if not check_password_hash(usuario["contrasena"], contrasena):
            return jsonify({"status": "error", "mensaje": "Contraseña incorrecta"}), 401

        # Crear sesión del usuario
        session['usuario_id'] = usuario['id']
        session['correo'] = usuario['correo']

        print(f"[LOGIN] Usuario inició sesión: {correo}")

        return jsonify({"status": "ok", "mensaje": "Inicio de sesión exitoso"})

    except Exception as e:
        print(f"Error en login: {e}")
        return jsonify({"status": "error", "mensaje": f"Error interno: {str(e)}"}), 500
    finally:
        if cursor: cursor.close()
        if conexion: conexion.close()

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"status": "ok", "mensaje": "Sesión cerrada correctamente"})

@app.route('/perfil')
def perfil():
    if 'usuario_id' not in session:
        return jsonify({"status": "error", "mensaje": "Acceso no autorizado"}), 401

    return jsonify({
        "status": "ok",
        "usuario": {
            "id": session['usuario_id'],
            "correo": session['correo']
        }
    })

@app.route('/productos', methods=['GET'])
def obtener_productos():
    try:
        conexion = get_connection()
        cursor = conexion.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT * FROM productos WHERE disponible = TRUE")
        productos = cursor.fetchall()
        cursor.close()
        conexion.close()
        return jsonify({"status": "ok", "productos": productos})
    except Exception as e:
        print(f"Error al obtener productos: {e}")
        return jsonify({"status": "error", "mensaje": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)


