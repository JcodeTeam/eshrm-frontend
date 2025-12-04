import express from 'express';
import upload from '../utils/upload.js';
import { createPermission, getPermissions, getUserPermissions, updatePermissionStatus } from '../controllers/permission.controller.js';
import { authorize, adminOnly } from '../middleware/auth.middleware.js'; 
import validateFileType from '../middleware/upload.middleware.js';

const permissionRoutes = express.Router();

permissionRoutes.post('/', authorize, upload.single('attachment'),  validateFileType, createPermission);

permissionRoutes.get('/', authorize, getUserPermissions);

permissionRoutes.get('/all', authorize, adminOnly, getPermissions);

permissionRoutes.post('/status/:id', authorize, adminOnly, updatePermissionStatus);

export default permissionRoutes;