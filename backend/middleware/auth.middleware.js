import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
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

        const user = await User.findById(decoded.id);

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
