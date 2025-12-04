import jwt from 'jsonwebtoken';
import { execQuery } from '../config/db.js';
import { JWT_SECRET } from '../config/env.js';

export const authorize = async (req, res, next) => {
    try {

        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized to access this route" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const users = await execQuery('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        req.user = user;

        next();

    } catch (err) {
        res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }
};

export const adminOnly = async (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." })
    }
    next()
};
