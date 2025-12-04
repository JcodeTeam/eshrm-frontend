import express from 'express';
import { PORT } from './config/env.js';
import './models/index.js';
import appMiddleware from './middleware/middleware.js';
import faceRoutes from './routes/face.routes.js';
import authRoutes from './routes/auth.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import permissionRoutes from './routes/permission.routes.js';

const app = express();
const port = PORT || 5000;
const host = '0.0.0.0';

appMiddleware(app);


app.use('/api', faceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', attendanceRoutes);
app.use('/api/permissions', permissionRoutes); 

app.get('/', (req, res) => {
    res.send('Express is running...');
});

app.listen(port, host, async () => {
    console.log(`🚀 Server berjalan di http://${host}:${port}`);
});