from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from models.user import UserModel
import requests
import jwt
import os

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = "mongodb+srv://choudharyprateek131:9927729187@cluster0.nkeq4ce.mongodb.net/gAuthApp"
client = MongoClient(MONGO_URI)
db = client.get_default_database()

# Secret key
JWT_SECRET = os.urandom(64)

# User model
user_model = UserModel(db)

@app.route('/google-login', methods=['POST'])
def google_login():
    data = request.json
    id_token = data.get('idToken')

    try:
        # Verify token with Google
        google_response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}")
        if google_response.status_code != 200:
            return jsonify({'message': 'Invalid Google token'}), 400

        google_data = google_response.json()
        sub = google_data.get('sub')
        email = google_data.get('email')
        name = google_data.get('name')
        given_name = google_data.get('given_name')
        family_name = google_data.get('family_name')
        picture = google_data.get('picture')

        # Find or create user
        user = user_model.find_by_google_id(sub)
        if not user:
            user_data = {
                'googleId': sub,
                'email': email,
                'name': name,
                'givenName': given_name,
                'familyName': family_name,
                'photo': picture
            }
            user = user_model.create_user(user_data)

        # JWT Token
        payload = {
            'userId': str(user['_id']),
            'email': user['email']
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

        return jsonify({
            'message': 'Google login successful',
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'photo': user.get('photo', '')
            },
            'token': token
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'message': 'Google authentication failed', 'error': str(e)}), 400

@app.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = user_model.find_by_id(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        return jsonify({
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'photo': user.get('photo', '')
            }
        }), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Failed to fetch user'}), 500

if __name__ == '__main__':
    app.run(port=4000)
