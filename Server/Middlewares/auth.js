const jwt = require('jsonwebtoken');

// Replace with your own secret key
const JWT_SECRET = 'InfinityArticles';

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ error: 'Invalid token.' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = authenticateToken;
