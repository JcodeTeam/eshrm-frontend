import Attendance from "../models/attendance.model.js";

export const attendance = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user._id; 

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude dan Longitude diperlukan"
            });
        }

        const location = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        let attendanceRecord = await Attendance.findOne({
            user: userId,
            date: startOfDay
        });

        const now = new Date();

        if (!attendanceRecord) {

            const lateThreshold = new Date(startOfDay).setHours(9, 0, 0, 0);
            const status = now > lateThreshold ? "late" : "present";

            attendanceRecord = new Attendance({
                user: userId,
                date: startOfDay,
                status: status,
                clockIn: now,
                clockInLocation: location
            });

            await attendanceRecord.save();

            const populatedRecord = await attendanceRecord.populate('user', 'name email');

            return res.status(201).json({
                success: true,
                message: "Absen Masuk berhasil dicatat",
                user: populatedRecord.user,
                attendance: {
                    clockIn: now,
                    clockInLocation: location
                }, 
            });
        }

        attendanceRecord.clockOut = now;
        attendanceRecord.clockOutLocation = location;

        await attendanceRecord.save();

        const populatedRecord = await attendanceRecord.populate('user', 'name email');

        return res.status(200).json({
            success: true,
            message: "Absen Pulang berhasil dicatat",
            user: populatedRecord.user,
            attendance: { 
                clockOut: attendanceRecord.clockOut, 
                clockOutLocation: attendanceRecord.clockOutLocation 
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

export const getAttendances = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); 

        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999); 

        const attendances = await Attendance.find({
            date: {
                $gte: startOfDay,
                $lte: endOfDay   

            }
        }).populate('user', 'name email').sort({ clockIn: -1 }); 

        res.status(200).json({
            success: true,
            count: attendances.length,
            message: `Data absensi hari ini (${startOfDay.toLocaleDateString('id-ID')}) berhasil diambil`,
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