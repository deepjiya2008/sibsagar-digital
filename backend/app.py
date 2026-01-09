from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
# Enable CORS so your React app (port 5173) can talk to this Flask app (port 5000)
CORS(app)

# --- Database Configuration ---
# CHANGE THESE VALUES to match your MySQL setup
db_config = {
    'user': 'root', 
    'password': 'password',  # <--- Put your MySQL password here
    'host': 'localhost',
    'database': 'sibsagar_db'
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

# --- Routes ---

@app.route('/api/monuments', methods=['GET'])
def get_monuments():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    # We rename columns (AS builtBy) so they match what React expects
    query = """
        SELECT 
            id, name, location, year, era, description, type, status, visitors,
            built_by as builtBy, 
            image_url as imageUrl
        FROM monuments
    """
    
    cursor.execute(query)
    monuments = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return jsonify(monuments)

@app.route('/api/monuments', methods=['POST'])
def add_monument():
    new_mon = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    
    sql = """
        INSERT INTO monuments 
        (name, location, built_by, year, era, description, type, status, image_url, visitors) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    # Default visitors to 0 if not provided
    visitors = new_mon.get('visitors', 0)
    
    val = (
        new_mon['name'], 
        new_mon['location'], 
        new_mon['builtBy'], 
        new_mon['year'], 
        new_mon.get('era', 'Ahom Kingdom'), # Default to Ahom Kingdom if missing
        new_mon['description'], 
        new_mon['type'], 
        new_mon['status'], 
        new_mon['imageUrl'],
        visitors
    )
    
    try:
        cursor.execute(sql, val)
        conn.commit()
        new_id = cursor.lastrowid
        message = "Monument added successfully"
        status_code = 201
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        message = "Failed to add monument"
        status_code = 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": message, "id": new_id}), status_code

@app.route('/api/monuments/<int:id>', methods=['DELETE'])
def delete_monument(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cursor = conn.cursor()
    sql = "DELETE FROM monuments WHERE id = %s"
    val = (id,)
    
    cursor.execute(sql, val)
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return jsonify({"message": "Deleted successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)