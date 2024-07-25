const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const connectDB = require('../Configs/mongooseConnection');

// Add Article
router.post('/add', async (req, res) => {
    const { title, shortDescription, longDescription, tags, images, videos, date, time, status } = req.body;
    try {
        const db = await connectDB();
        const collection = db.collection('articles');
        const result = await collection.insertOne({ title, shortDescription, longDescription, tags, images, videos, date, time, status });
        res.status(201).send(result.ops[0]);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Update Article
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { title, shortDescription, longDescription, tags, images, videos, date, time, status } = req.body;
    try {
        const db = await connectDB();
        const collection = db.collection('articles');
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { title, shortDescription, longDescription, tags, images, videos, date, time, status } },
            { returnOriginal: false }
        );
        res.status(200).send(result.value);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete Article
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectDB();
        const collection = db.collection('articles');
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
