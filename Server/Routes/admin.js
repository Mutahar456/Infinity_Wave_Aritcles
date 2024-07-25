const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const authenticateToken = require('../Middlewares/auth');
const connectDB = require('../Configs/mongooseConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'InfinityArticles';

// Admin registration
router.post('/add', async (req, res) => {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
        return res.status(400).send({ error: 'All fields are required.' });
    }

    try {
        const db = await connectDB();
        const collection = db.collection('admins');

        // Check if the email already exists
        const existingAdmin = await collection.findOne({ email });
        if (existingAdmin) {
            return res.status(400).send({ error: 'Email already in use.' });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await collection.insertOne({ userName, email, password: hashedPassword });

        // Construct the inserted document with the insertedId
        const insertedDocument = {
            _id: result.insertedId,
            userName,
            email,
            password: hashedPassword
        };

        // Generate JWT token
        const token = jwt.sign({ id: insertedDocument._id, email: insertedDocument.email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).send({ user: insertedDocument, token });
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

// Admin login
router.post('/login', async (req, res) => {
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
router.put('/update/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userName, email, password } = req.body;

    try {
        const db = await connectDB();
        const collection = db.collection('admins');

        const updatedFields = { userName, email };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedFields.password = hashedPassword;
        }

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updatedFields },
            { returnOriginal: false }
        );

        res.status(200).send(result.value);
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(400).send({ error: 'An unexpected error occurred.' });
    }
});

// Delete Admin
router.delete('/delete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: 'Invalid ID format' });
    }

    try {
        const db = await connectDB();
        const collection = db.collection('admins');
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'Admin not found' });
        }

        res.status(200).send({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(400).send({ error: 'An unexpected error occurred.' });
    }
});

module.exports = router;
