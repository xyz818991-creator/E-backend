import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
    customization: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: 'carts',
    timestamps: true
  });
};

