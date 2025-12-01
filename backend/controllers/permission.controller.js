import Permission from "../models/permission.model.js";

export const createPermission = async (req, res) => {
    try {
        const userId = req.user._id; // Didapat dari middleware auth
        const { type, date, reason } = req.body;
        
        // Cek apakah ada file yang diupload via Multer
        // req.file otomatis ada jika upload berhasil
        const attachmentPath = req.file ? req.file.path : null;

        // Validasi input dasar
        if (!type || !date || !reason) {
            return res.status(400).json({
                success: false,
                message: "Semua field (tipe, tanggal, alasan) wajib diisi."
            });
        }

        // Khusus Sakit, disarankan ada bukti (opsional tergantung aturan perusahaan)
        if (type === 'sick' && !attachmentPath) {
            // Bisa di-uncomment jika ingin mewajibkan bukti sakit
            // return res.status(400).json({ message: "Bukti sakit wajib diupload." });
        }

        const newPermission = new Permission({
            user: userId,
            type, // 'sick' atau 'permit'
            date: new Date(date),
            reason,
            attachment: attachmentPath, // Simpan path file (misal: uploads/file-123.jpg)
        });

        await newPermission.save();

        res.status(201).json({
            success: true,
            message: "Pengajuan berhasil dikirim.",
            data: newPermission
        });

    } catch (error) {
        console.error("Permission Error:", error);
        res.status(500).json({
            success: false,
            message: "Gagal memproses pengajuan.",
            error: error.message
        });
    }
};

export const getUserPermissions = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Ambil list izin user tersebut, urutkan dari yang terbaru
        const permissions = await Permission.find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal mengambil riwayat izin.",
            error: error.message
        });
    }
};