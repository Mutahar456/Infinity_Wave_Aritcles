const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const authenticateToken = require('../Middlewares/auth');
const connectDB = require('../Configs/mongooseConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const JWT_SECRET = 'InfinityArticles';


router.post('/add',  async (req, res) => {
    const {  userName, email, password } = req.body;

    if ( !userName || !email || !password) {
        return res.status(400).send({ error: 'All fields are required.' });
    }

    try {
        const db = await connectDB();
        const collection = db.collection('admins');

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await collection.insertOne({  userName, email, password: hashedPassword });

        // Construct the inserted document with the insertedId
        const insertedDocument = {
            _id: result.insertedId,
            userName,
            email,
            password: hashedPassword
        };

        res.status(201).send(insertedDocument);
    } catch (error) {
        console.error('Error adding admin:', error);

        // Check if it's a MongoDB error
        if (error.name === 'MongoError') {
            return res.status(500).send({ error: 'Database error occurred.' });
        }

        // Send a generic error message for other types of errors
        res.status(500).send({ error: 'An unexpected error occurred.' });
    }
});


router.get('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Email and password are required.' });
    }

    try {
        const db = await connectDB();
        const collection = db.collection('admins');
        const user = await collection.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).send({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send({ error: 'An unexpected error occurred.' });
    }
});



// Update Admin
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { userName, email, password } = req.body;
    try {
        const db = await connectDB();
        const collection = db.collection('admins');
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { userName, email, password } },
            { returnOriginal: false }
        );
        res.status(200).send(result.value);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete Admin
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectDB();
        const collection = db.collection('admins');
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
