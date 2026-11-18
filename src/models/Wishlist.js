import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Wishlist', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'wishlists',
    timestamps: true
  });
};

