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

export const getPermissions = async (req, res) => {
    try {
        
        const permissions = await Permission.find()
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

export const updatePermissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'approved', 'rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status tidak valid."
            });
        }

        const permission = await Permission.findById(id);
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Izin tidak ditemukan."
            });
        }

        permission.status = status;
        await permission.save();

        res.status(200).json({
            success: true,
            message: "Status izin berhasil diperbarui.",
            data: permission
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal memperbarui status izin.",
            error: error.message
        });
    }
};