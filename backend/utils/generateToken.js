const jwt = require('jsonwebtoken');

const generateToken = (req, res, userId, role) => {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });

    const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    console.log(`Setting JWT cookie for ${userId} (role: ${role}), secure: ${!isLocalhost && process.env.NODE_ENV !== 'development'}`);

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: !isLocalhost && process.env.NODE_ENV !== 'development', // Avoid secure on localhost
        sameSite: 'lax', // Use Lax for local dev ease if needed
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return token;
};

module.exports = generateToken;