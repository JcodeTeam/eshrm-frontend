import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            image_url: req.body.image?.url || null, 
            image_public_id: req.body.image?.public_id || null
        });

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
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

        const user = await User.findOne({ where: { email } });

        if (!user || !(await user.comparePassword(password))) {
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
                role: user.role,
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

        const user = await User.findByPk(decoded.id, 
            {
                attributes: ['id', 'name', 'email', 'role', 'created_at']
            }
        ); 

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