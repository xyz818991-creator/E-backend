import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    shipping_cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    tax_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    coupon_id: { type: DataTypes.INTEGER, allowNull: true },
    coupon_code: { type: DataTypes.STRING, allowNull: true },
    order_status: {
      type: DataTypes.ENUM('placed', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'placed'
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    payment_method: { type: DataTypes.STRING, defaultValue: 'cod' },
    payment_id: { type: DataTypes.STRING, allowNull: true },
    tracking_number: { type: DataTypes.STRING, allowNull: true },
    courier_partner: { type: DataTypes.STRING, allowNull: true },
    shipping_address: { type: DataTypes.JSON, allowNull: false },
    billing_address: { type: DataTypes.JSON, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'orders',
    timestamps: true
  });
};

