import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM('admin', 'customer', 'staff'), defaultValue: 'customer' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    profile_image: { type: DataTypes.STRING, allowNull: true },
    addresses: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    notification_preferences: {
      type: DataTypes.JSON,
      defaultValue: { order_updates: true, promotions: true, email: true, sms: false, whatsapp: false }
    },
    last_login_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'users',
    timestamps: true
  });
};

