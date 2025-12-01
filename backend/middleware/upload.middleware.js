import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pastikan folder uploads ada
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Simpan di folder 'uploads'
    },
    filename: function (req, file, cb) {
        // Format nama file: USERID-TIMESTAMP.extensi
        // Contoh: 64a7b...-1709999.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter jenis file (Hanya Gambar & PDF)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar dan PDF yang diperbolehkan!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // Batas ukuran file 5MB
    }
});

export default upload;