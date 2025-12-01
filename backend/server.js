import express from 'express';
import path from 'path'; // Tambahan untuk akses path direktori
import { fileURLToPath } from 'url'; // Tambahan untuk ES Modules

import connectDB from './config/db.js';
import { PORT } from './config/env.js';
import appMiddleware from './middleware/middleware.js';
import faceRoutes from './routes/face.routes.js';
import authRoutes from './routes/auth.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import permissionRoutes from './routes/permission.routes.js'; // 1. Import Route Permission

// Konfigurasi __dirname untuk ES Modules (karena "type": "module" di package.json)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = PORT || 5000;
const host = '0.0.0.0';

appMiddleware(app);

// 2. Setup Static Folder agar file di folder 'uploads' bisa diakses via URL
// Contoh akses: http://IP_ADDRESS:5000/uploads/file-bukti.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Registrasi Routes
app.use('/api', faceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', attendanceRoutes);
app.use('/api/permissions', permissionRoutes); // Daftarkan endpoint izin

// Default Route
app.get('/', (req, res) => {
    res.send('Express is running...');
});

// Health Checks
app.get('/ping', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date(),
        message: 'Server is running' 
    });
});

app.get('/health', (req, res) => {
    res.send('OK');
});

// Start Server
app.listen(port, host, async () => {
    await connectDB();
    console.log(`🚀 Server berjalan di http://${host}:${port}`);
});