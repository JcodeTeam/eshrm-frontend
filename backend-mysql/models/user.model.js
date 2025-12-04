import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING(255),
        allowNull: false, 
        unique: true,     
    },

    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },

    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    image_public_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },

    role: {
        type: DataTypes.ENUM('admin', 'user'), 
        defaultValue: 'user',     
        allowNull: false,
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,

    hooks: {
        beforeSave: async (user, options) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default User;
