import Permission from "../models/permission.model.js";
import User from "../models/user.model.js";

export const createPermission = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { type, date, reason } = req.body;

        const attachmentPath = req.file ? req.file.path : null;

        if (!type || !date || !reason) {
            return res.status(400).json({
                success: false,
                message: "Semua field wajib diisi."
            });
        }

        const newPermission = await Permission.create({
            user_id: userId,
            type, // 'sick' atau 'permit'
            permission_date: new Date(date),
            reason,
            attachment: attachmentPath, 
        });

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
        const userId = req.user.id;
        
        const permissions = await Permission.findAll({ 
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        })

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
        
        const permissions = await Permission.findAll({
            include: [{
                model: User,
                as: 'User',
                attributes: ['name', 'email'], 
                required: true
            }],
            order: [['created_at', 'DESC']]
        })

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

        const [rowsUpdated] = await Permission.update(
            { status: status },
            { where: { id: id } }
        );

        if (rowsUpdated === 0) {
            return res.status(404).json({ success: false, message: "Izin tidak ditemukan." });
        }

        const updatedPermission = await Permission.findByPk(id);

        res.status(200).json({
            success: true,
            message: "Status izin berhasil diperbarui.",
            data: updatedPermission
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal memperbarui status izin.",
            error: error.message
        });
    }
};