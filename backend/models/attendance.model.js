import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["present", "absent", "late"],
        default: "present",
    },
    location: {
        type: {
            type: String, 
            enum: ['Point'], 
            required: true
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    }
}, { timestamps: true });

attendanceSchema.index({ location: '2dsphere' });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;