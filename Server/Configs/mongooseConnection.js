const { MongoClient } = require('mongodb');

// Replace with your MongoDB Atlas connection string
const url = 'mongodb+srv://mutaharHashmi:mutaharHashmi786@cluster0.vcagjlh.mongodb.net/InfinityArticle?retryWrites=true&w=majority&appName=Cluster0';

// Create a new MongoClient
const client = new MongoClient(url);

async function connectDB() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log('Connected successfully to MongoDB Atlas');

        // Select the database
        const db = client.db('InfinityArticle');

        // Return the database object
        return db;
    } catch (err) {
        console.error('Failed to connect to the database:', err);
        throw err;  // rethrow the error to handle it in app.js
    }
}

module.exports = connectDB;
