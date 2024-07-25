const dotenv=require('dotenv').config();
const express = require('express');
const connectDB = require('./Configs/mongooseConnection'); // Assuming your database connection code is in 'db.js'
const adminRoutes = require('./Routes/admin');
const articleRoutes = require('./Routes/articles');

const app = express();
app.use(express.json());

// Use Routes
app.use('/api/admin', adminRoutes);
app.use('/api/article', articleRoutes);

// Start the Server
const PORT = process.env.PORT || 5000;

(async () => {
    try {
        // Connect to the database
        await connectDB();
        console.log('MongoDB connected successfully');

        // Start the server after the database connection is established
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to the database. Server not started.', err);
        process.exit(1); // Exit the process with failure
    }
})();
