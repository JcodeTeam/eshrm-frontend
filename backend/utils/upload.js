import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileTypeFromBuffer } from 'file-type';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'data', 'uploads');
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// Use memory storage so we can sniff file content before writing to disk
const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
});

// Export a middleware that runs multer.single and then validates & saves the file
const uploadMiddleware = (req, res, next) => {
    const single = uploadMemory.single('attachment');

    single(req, res, async (err) => {
        if (err) {
            return next(err);
        }

        // No file uploaded
        if (!req.file) {
            return next();
        }

        try {
            // Detect file type from buffer
            const type = await fileTypeFromBuffer(req.file.buffer);

            if (!type) {
                return res.status(400).json({ success: false, message: 'Tipe file tidak dikenali.' });
            }

            const allowed = type.mime.startsWith('image/') || type.mime === 'application/pdf';
            if (!allowed) {
                return res.status(400).json({ success: false, message: 'Hanya file gambar dan PDF yang diperbolehkan! (detected: ' + type.mime + ')' });
            }

            // Ensure upload dir exists
            if (!fs.existsSync(UPLOAD_DIR)) {
                fs.mkdirSync(UPLOAD_DIR, { recursive: true });
            }

            // Create unique filename similar to previous behavior
            const safeUser = req.user && req.user.name ? req.user.name : 'anon';
            const uniqueSuffix = safeUser + '_' + Date.now() + '-' + Math.round(Math.random() * 900000) + 100000 + path.extname(req.file.originalname || ('.' + type.ext));
            const savePath = path.join(UPLOAD_DIR, uniqueSuffix);

            // Write buffer to disk
            fs.writeFileSync(savePath, req.file.buffer);

            // Attach path and detected mimetype to req.file to be consistent with diskStorage behavior
            req.file.path = savePath;
            req.file.mimetype = type.mime;
            req.file.detectedExt = type.ext;

            next();
        } catch (e) {
            console.error('Upload processing error:', e);
            res.status(500).json({ success: false, message: 'Gagal memproses file upload.' });
        }
    });
};

export default uploadMiddleware;