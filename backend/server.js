import express from 'express';
import connectDB from './config/db.js';
import { PORT } from './config/env.js';
import appMiddleware from './middleware/middleware.js';
import faceRoutes from './routes/face.routes.js';
import authRoutes from './routes/auth.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';

const app = express();
const port = PORT || 5000;
const host = '192.168.1.14';

appMiddleware(app);

app.use('/api', faceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', attendanceRoutes);
app.get('/', (req, res) => {
    res.send('Express is running...');
});

// Tambahkan '0.0.0.0' agar bisa diakses dari luar (HP)
app.listen(port, '0.0.0.0', async () => {
    await connectDB();
    console.log(`🚀 Server berjalan di http://0.0.0.0:${port}`);
});
