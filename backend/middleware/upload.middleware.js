import fs from 'fs';
import { fileTypeFromFile } from 'file-type'; 

const validateFileType = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const filePath = req.file.path; 

    try {
        const type = await fileTypeFromFile(filePath);

        const allowed = type && (type.mime.startsWith('image/') || type.mime === 'application/pdf');

        if (allowed) {
            next(); 
        } else {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                error: `Hanya file gambar dan PDF yang diperbolehkan! (Terdeteksi: ${type ? type.mime : 'Tidak Dikenali'})`
            });
        }
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return res.status(500).json({ error: 'Gagal memproses validasi file di server.' });
    }
};

export default validateFileType;