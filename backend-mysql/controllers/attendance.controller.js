import { execQuery } from '../config/db.js';

const formatDateToSQLDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const attendance = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id; 

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude dan Longitude diperlukan"
            });
        }

        const now = new Date();
        const attendanceDate = formatDateToSQLDate(now);
        const location = { latitude, longitude };

        const findSql = 'SELECT * FROM attendances WHERE user_id = ? AND attendance_date = ?';
        const records = await execQuery(findSql, [userId, attendanceDate]);
        let attendanceRecord = records[0];


        if (!attendanceRecord) {

            const lateThreshold = new Date(now);
            lateThreshold.setHours(9, 0, 0, 0);

            const status = now > lateThreshold ? "late" : "present";

            const insertSql = `
                INSERT INTO attendances (
                    user_id, attendance_date, status, clock_in, 
                    clock_in_latitude, clock_in_longitude
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;
            const insertParams = [
                userId,
                attendanceDate,
                status,
                now,
                latitude,
                longitude
            ];

            const result = await execQuery(insertSql, insertParams);
            const newRecordId = result.insertId;

            return res.status(201).json({
                success: true,
                message: "Absen Masuk berhasil dicatat",
                user: { id: userId, name: req.user.name, email: req.user.email },
                attendance: {
                    id: newRecordId,
                    clockIn: now,
                    clockInLocation: location
                }, 
            });
        }

        const updateSql = `
            UPDATE attendances 
            SET clock_out = ?, clock_out_latitude = ?, clock_out_longitude = ? 
            WHERE id = ?
        `;
        const updateParams = [now, latitude, longitude, attendanceRecord.id];
        
        await execQuery(updateSql, updateParams);

        return res.status(200).json({
            success: true,
            message: "Absen Pulang berhasil dicatat",
            user: { id: userId, name: req.user.name, email: req.user.email },
            attendance: {
                clockIn: now,
                clockInLocation: location
            }, 
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan internal di server",
            error: error.message
        });
    }
};

export const getUserAttendances = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const now = new Date();
        const attendanceDate = formatDateToSQLDate(now);

        const sql = `
            SELECT * FROM attendances 
            WHERE user_id = ? AND attendance_date = ?
            ORDER BY clock_in DESC
        `;
        const attendances = await execQuery(sql, [userId, attendanceDate]);

        res.status(200).json({
            success: true,
            count: attendances.length,
            message: `Data absensi Anda hari ini berhasil diambil`,
            attendances: attendances
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan internal di server",
            error: error.message
        });
    }
};

export const getAttendances = async (req, res) => {
    try {
        const sql = `
            SELECT 
                a.*, 
                u.name AS user_name, 
                u.email AS user_email
            FROM attendances a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.clock_in DESC, a.created_at DESC
        `;

        const rawAttendances = await execQuery(sql);

        res.status(200).json({
            success: true,
            count: rawAttendances.length,
            message: `Data absensi`,
            attendances: rawAttendances
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan internal di server",
            error: error.message
        });
    }
};