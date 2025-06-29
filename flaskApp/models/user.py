from pymongo import MongoClient
from bson.objectid import ObjectId

class UserModel:
    def __init__(self, db):
        self.collection = db['users']

    def find_by_google_id(self, google_id):
        return self.collection.find_one({'googleId': google_id})

    def find_by_id(self, user_id):
        return self.collection.find_one({'_id': ObjectId(user_id)})

    def create_user(self, user_data):
        result = self.collection.insert_one(user_data)
        return self.collection.find_one({'_id': result.inserted_id})
