import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Address', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    address_line1: { type: DataTypes.STRING, allowNull: false },
    address_line2: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    postal_code: { type: DataTypes.STRING, allowNull: false },
    is_default: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'addresses',
    timestamps: true
  });
};

