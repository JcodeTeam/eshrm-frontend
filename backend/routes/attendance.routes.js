import express from 'express';
import { attendance, getAttendances } from '../controllers/attendance.controller.js';
import { authorize } from '../middleware/auth.middleware.js';

const attendanceRoutes = express.Router();

attendanceRoutes.post('/attendance', authorize, attendance);
attendanceRoutes.get('/attendance', authorize, getAttendances);

export default attendanceRoutes;


