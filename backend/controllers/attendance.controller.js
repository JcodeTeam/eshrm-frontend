import Attendance from "../models/attendance.model.js";

// export const attendance = async (req, res) => {
//     try {
//         const { status, latitude, longitude } = req.body;

//         const userId = req.user;

//         if (!latitude || !longitude) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Latitude dan Longitude diperlukan"
//             });
//         }

//         const location = {
//             type: "Point",
//             coordinates: [longitude, latitude]
//         };

//         const newAttendance = new Attendance({
//             user: userId,
//             status,
//             location
//         });

//         await newAttendance.save();

//         const populate = await Attendance.findById(newAttendance._id).populate('user', 'name email');

//         res.status(201).json({
//             success: true,
//             message: "Absensi berhasil dicatat",
//             attendance: populate
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Terjadi kesalahan internal di server",
//             error: error.message
//         });
//     }
// };

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
                attendance: populatedRecord
            });
        }

        if (attendanceRecord.clockOut) {
            return res.status(400).json({
                success: false,
                message: "Anda sudah melakukan absen pulang hari ini"
            });
        }

        attendanceRecord.clockOut = now;
        attendanceRecord.clockOutLocation = location;

        await attendanceRecord.save();

        const populatedRecord = await attendanceRecord.populate('user', 'name email');

        return res.status(200).json({
            success: true,
            message: "Absen Pulang berhasil dicatat",
            attendance: populatedRecord
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
        const attendances = await Attendance.find().populate('user', 'name email');

        res.status(200).json({
            success: true,
            attendances
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