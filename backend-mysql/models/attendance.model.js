import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },

    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },

    status: {
        type: DataTypes.ENUM('present', 'absent', 'late'),
        allowNull: true, 
        defaultValue: 'present', 
    },

    clock_in: {
        type: DataTypes.DATE, 
        allowNull: false,
    },

    clock_in_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
    },
    clock_in_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
    },

    clock_out: {
        type: DataTypes.DATE, 
        allowNull: true, 
    },

    clock_out_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
    },
    clock_out_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true, 
    },

    attendance_date: {
        type: DataTypes.DATEONLY, 
        allowNull: false, 
    }


}, {
    tableName: 'attendances',
    timestamps: true,
    underscored: true,
});

export default Attendance;