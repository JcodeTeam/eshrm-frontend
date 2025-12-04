import User from './user.model.js';
import Attendance from './attendance.model.js';
import Permission from './permission.model.js';

Attendance.belongsTo(User, {
    foreignKey: 'user_id', 
    as: 'User'
});

Permission.belongsTo(User, {
    foreignKey: 'user_id', 
    as: 'User'
});

User.hasMany(Attendance, {
    foreignKey: 'user_id'
});

User.hasMany(Permission, {
    foreignKey: 'user_id'
});

export { User, Attendance };