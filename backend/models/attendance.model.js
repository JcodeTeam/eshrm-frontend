import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["present", "absent", "late"],
        default: "absent",
    },
    clockIn: {
        type: Date,
        required: true,
    },
    clockInLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    clockOut: {
        type: Date,
    },
    clockOutLocation: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    }
}, { timestamps: true });

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

attendanceSchema.index({ clockInLocation: '2dsphere' });
attendanceSchema.index({ clockOutLocation: '2dsphere' });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;