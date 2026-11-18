import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    image_url: { type: DataTypes.STRING, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'categories',
    timestamps: true
  });
};

