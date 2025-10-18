# Setup file template to upload data to MongoDB Atlas
MONGO_URL="mongodb+srv://rupa123:rupasingh123@qkart-advance.4dyzxsa.mongodb.net/"
mongoimport --uri "$MONGO_URL" --drop --collection users --file src/data/export_qkart_users.json
mongoimport --uri "$MONGO_URL" --drop --collection products --file src/data/export_qkart_products.json