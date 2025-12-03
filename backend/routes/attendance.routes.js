import express from 'express';
import { attendance, getAttendances, getUserAttendances } from '../controllers/attendance.controller.js';
import { authorize, adminOnly } from '../middleware/auth.middleware.js';

const attendanceRoutes = express.Router();

attendanceRoutes.post('/attendance', authorize, attendance);

attendanceRoutes.get('/attendance', authorize, getUserAttendances);

attendanceRoutes.get('/attendance/all', authorize, adminOnly, getAttendances);

export default attendanceRoutes;


