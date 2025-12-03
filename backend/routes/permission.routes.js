import express from 'express';
import upload from '../utils/upload.js';
import { createPermission, getUserPermissions } from '../controllers/permission.controller.js';
import { authorize } from '../middleware/auth.middleware.js'; 
import validateFileType from '../middleware/upload.middleware.js';

const permissionRoutes = express.Router();

permissionRoutes.post('/', authorize, upload.single('attachment'),  validateFileType, createPermission);

permissionRoutes.get('/', authorize, getUserPermissions);

export default permissionRoutes;