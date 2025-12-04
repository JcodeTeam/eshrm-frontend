import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; 

const Permission = sequelize.define('Permission', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },

    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false, 
    },

    type: {
        type: DataTypes.ENUM('sick', 'permit'),
        allowNull: false,
    },

    permission_date: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
    },

    reason: {
        type: DataTypes.TEXT, 
        allowNull: false, 
    },

    attachment: {
        type: DataTypes.STRING(255), 
        allowNull: true, 
        defaultValue: null,
    },

    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: true,
        defaultValue: 'pending',
    },

}, {
    tableName: 'permissions',
    timestamps: true,
    underscored: true,
});

export default Permission;