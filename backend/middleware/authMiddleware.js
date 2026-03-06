const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
