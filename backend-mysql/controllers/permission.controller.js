import { execQuery } from "../config/db.js";

const formatDateToSQLDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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

        const permissionDate = formatDateToSQLDate(date);

        const sql = `
            INSERT INTO permissions 
                (user_id, type, permission_date, reason, attachment, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        `;
        const params = [
            userId,
            type,
            permissionDate,
            reason,
            attachmentPath
        ];

        const result = await execQuery(sql, params);
        const newPermissionId = result.insertId;

        const newPermissionData = {
            id: newPermissionId,
            user_id: userId,
            type,
            permission_date: permissionDate,
            reason,
            attachment: attachmentPath,
            status: 'pending',
            created_at: new Date()
        };

        res.status(201).json({
            success: true,
            message: "Pengajuan berhasil dikirim.",
            data: newPermissionData
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
        
        const sql = `
            SELECT * FROM permissions 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;
        const permissions = await execQuery(sql, [userId]);

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
        
        const sql = `
            SELECT p.*, u.name AS user_name, u.email AS user_email
            FROM permissions p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `;

        const rawPermissions = await execQuery(sql);

        const permissions = rawPermissions.map(p => ({
            id: p.id,
            user: { id: p.user_id, name: p.user_name, email: p.user_email },
            type: p.type,
            date: p.permission_date,
            reason: p.reason,
            attachment: p.attachment,
            status: p.status,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));

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

        const findSql = 'SELECT * FROM permissions WHERE id = ?';
        const permissions = await execQuery(findSql, [id]);
        const permission = permissions[0];

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Izin tidak ditemukan."
            });
        }

        const updateSql = 'UPDATE permissions SET status = ? WHERE id = ?';
        await execQuery(updateSql, [status, id]);

        const updatedPermissionData = {
            ...permission,
            status: status,
            updated_at: new Date() 
        };

        res.status(200).json({
            success: true,
            message: "Status izin berhasil diperbarui.",
            data: updatedPermissionData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal memperbarui status izin.",
            error: error.message
        });
    }
};