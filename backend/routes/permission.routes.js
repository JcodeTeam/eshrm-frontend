import express from 'express';
import { createPermission, getUserPermissions } from '../controllers/permission.controller.js';
import { authorize } from '../middleware/auth.middleware.js'; // Middleware Cek Token JWT
import upload from '../middleware/upload.middleware.js'; // Middleware Multer

const permissionRoutes = express.Router();

// Endpoint POST: /api/permissions
// Menggunakan 'upload.single("attachment")' -> nama field di Flutter harus "attachment"
permissionRoutes.post('/', authorize, upload.single('attachment'), createPermission);

// Endpoint GET: /api/permissions (Riwayat)
permissionRoutes.get('/', authorize, getUserPermissions);

export default permissionRoutes;