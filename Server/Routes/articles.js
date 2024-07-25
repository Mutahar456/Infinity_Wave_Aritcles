const express = require('express');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const connectDB = require('../Configs/mongooseConnection');
const { uploadFileToCloudinary } = require('../Configs/upload');
const authenticateToken = require('../Middlewares/auth'); // Import the authentication middleware

const router = express.Router();

// Configure multer
const upload = multer({ dest: 'uploads/' }); // Define storage options if needed

const handleError = (res, error) => {
    console.error(error);
    res.status(500).send({ error: 'An internal error occurred' });
};

// Add article with file upload
router.post('/add', authenticateToken, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 10 }]), async (req, res) => {
    const { title, shortDescription, longDescription, tags, date, time, status } = req.body;
    const images = req.files['images'] || [];
    const videos = req.files['videos'] || [];

    if (!title || !shortDescription || !longDescription) {
        return res.status(400).send({ error: 'Title, short description, and long description are required' });
    }

    try {
        const db = await connectDB();
        const collection = db.collection('articles');

        const uploadedImageUrls = images.length > 0 ? await Promise.all(images.map(file => uploadFileToCloudinary(file.path))) : [];
        const uploadedVideoUrls = videos.length > 0 ? await Promise.all(videos.map(file => uploadFileToCloudinary(file.path))) : [];

        const article = {
            title,
            shortDescription,
            longDescription,
            tags: tags ? tags.split(',') : [], // Convert comma-separated tags to array
            images: uploadedImageUrls,
            videos: uploadedVideoUrls,
            date,
            time,
            status
        };

        const result = await collection.insertOne(article);
        console.log(result);
        res.status(200).send(result);
    } catch (error) {
        handleError(res, error);
    }
});

// Update article with file upload
router.put('/update/:id', authenticateToken, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 10 }]), async (req, res) => {
    const { id } = req.params;
    const { title, shortDescription, longDescription, tags, date, time, status } = req.body;
    const images = req.files['images'] || [];
    const videos = req.files['videos'] || [];

    try {
        const db = await connectDB();
        const collection = db.collection('articles');

        const uploadedImageUrls = images.length > 0 ? await Promise.all(images.map(file => uploadFileToCloudinary(file.path))) : [];
        const uploadedVideoUrls = videos.length > 0 ? await Promise.all(videos.map(file => uploadFileToCloudinary(file.path))) : [];

        const updatedArticle = {
            title,
            shortDescription,
            longDescription,
            tags: tags ? tags.split(',') : [],
            images: uploadedImageUrls,
            videos: uploadedVideoUrls,
            date,
            time,
            status
        };

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updatedArticle },
            { returnOriginal: false }
        );
        res.status(200).send(result.value);
    } catch (error) {
        handleError(res, error);
    }
});

// Delete article
router.delete('/delete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: 'Invalid ID format' });
    }

    try {
        const db = await connectDB();
        const collection = db.collection('articles');
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'Article not found' });
        }

        res.status(200).send({ message: 'Article deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
