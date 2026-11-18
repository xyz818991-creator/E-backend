import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Store', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    value: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'store_settings',
    timestamps: true
  });
};

