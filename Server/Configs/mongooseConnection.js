const { MongoClient } = require('mongodb');
const url = process.env.MONGO_URI;

if (!url) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
}

const client = new MongoClient(url);

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB Atlas');
        const db = client.db('InfinityArticle');
        return db;
    } catch (err) {
        console.error('Failed to connect to the database:', err);
        throw err;
    }
}

module.exports = connectDB;
