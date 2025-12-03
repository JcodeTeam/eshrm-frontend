import Permission from "../models/permission.model.js";

export const createPermission = async (req, res) => {
    try {
        const userId = req.user._id; 
        const { type, date, reason } = req.body;

        const attachmentPath = req.file ? req.file.path : null;

        if (!type || !date || !reason) {
            return res.status(400).json({
                success: false,
                message: "Semua field wajib diisi."
            });
        }

        const newPermission = new Permission({
            user: userId,
            type, // 'sick' atau 'permit'
            date: new Date(date),
            reason,
            attachment: attachmentPath, 
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