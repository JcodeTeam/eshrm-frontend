import multer from 'multer';
import fs  from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'data', 'uploads'); 

const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            if (!fs.existsSync(UPLOAD_DIR)) {
                fs.mkdirSync(UPLOAD_DIR, { recursive: true });
            }
            cb(null, UPLOAD_DIR);
        },

        filename:  function (req, file, cb) {
            const uniqueSuffix = req.user.name + '_' + Date.now() + '-' + Math.round(Math.random() * 900000) + 100000 + path.extname(file.originalname);
            cb(null, uniqueSuffix);
        }
    }

);

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024 
    }
});

export default upload;