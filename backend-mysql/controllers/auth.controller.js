import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { execQuery } from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

export const register = async (req, res) => {

    try {
        const { name, email, password, role } = req.body;

        const existingUser = await execQuery('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = `
            INSERT INTO users (name, email, password, role, image_url, image_public_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
            name,
            email,
            hashedPassword,
            role || 'user',
            req.body.image?.url || null,
            req.body.image?.public_id || null
        ];

        const result = await execQuery(sql, params);
        const newUserId = result.insertId;

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            user: {
                id: newUserId,
                name: name,
                email: email,
                role: role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registrasi gagal',
            error: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const users = await execQuery('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Email atau password salah' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email atau password salah' });
        }

        const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.json({
            success: true,
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Login gagal', error: error.message });
    }
};


export const whoAmI = async (req, res) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
        }

        const parts = authHeader.split(' ');
        const token = parts.length === 2 ? parts[1] : parts[0];

        const decoded = jwt.verify(token, JWT_SECRET);

        const sql = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
        const users = await execQuery(sql, [decoded.id]);
        const user = users[0];
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        res.json({
            success: true,
            user,
        });
        
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token tidak valid', error: error.message });
    }
};