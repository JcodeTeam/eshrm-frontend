import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";

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

        const attendanceRecord = await Attendance.findOne({
            where: {
                user_id: userId,
                attendance_date: attendanceDate
            }
        });


        if (!attendanceRecord) {

            const lateThreshold = new Date(now);
            lateThreshold.setHours(9, 0, 0, 0);

            const status = now > lateThreshold ? "late" : "present";

            const newRecord = await Attendance.create({
                user_id: userId,
                attendance_date: attendanceDate,
                status: status,
                clock_in: now,
                clock_in_latitude: latitude,
                clock_in_longitude: longitude
            });

            const userDetails = { id: userId, name: req.user.name, email: req.user.email };

            return res.status(201).json({
                success: true,
                message: "Absen Masuk berhasil dicatat",
                user: userDetails,
                attendance: {
                    id: newRecord,
                    clockIn: now,
                    clockInLocation: location
                },
            });
        }

        attendanceRecord.clock_out = now;
        attendanceRecord.clock_out_latitude = latitude;
        attendanceRecord.clock_out_longitude = longitude;

        await attendanceRecord.save();

        const userDetails = { id: userId, name: req.user.name, email: req.user.email };

        return res.status(200).json({
            success: true,
            message: "Absen Pulang berhasil dicatat",
            user: userDetails,
            attendance: {
                clockIn: attendanceRecord.clock_out,
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

        const attendances = await Attendance.findAll({
            where: {
                user_id: userId,
                attendance_date: attendanceDate
            },
            order: [
                ['clock_in', 'DESC']
            ]
        });

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
        const attendances = await Attendance.findAll({
            include: [{
                model: User,
                as: 'User',
                attributes: ['name', 'email'], 
                required: true 
            }],
            order: [
                ['clock_in', 'DESC'],
                ['created_at', 'DESC']
            ]
        });

        res.status(200).json({
            success: true,
            count: attendances.length,
            message: `Data absensi`,
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