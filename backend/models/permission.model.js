import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["sick", "permit"], 
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    attachment: {
        type: String, 
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    }
}, { timestamps: true });

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;