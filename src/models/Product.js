import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    short_description: { type: DataTypes.STRING(500), allowNull: true },
    original_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    selling_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_published: { type: DataTypes.BOOLEAN, defaultValue: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    material: { type: DataTypes.STRING, defaultValue: '24k Antique Gold Plated' },
    colour: { type: DataTypes.STRING, defaultValue: 'Antique Gold' },
    occasion: { type: DataTypes.STRING, defaultValue: 'Bridal & Festive' },
    collection_type: { type: DataTypes.STRING, defaultValue: 'Temple Jewellery' },
    weight: { type: DataTypes.STRING, defaultValue: '50g' },
    dimensions: { type: DataTypes.STRING, defaultValue: '' },
    rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 4.8 },
    reviews_count: { type: DataTypes.INTEGER, defaultValue: 50 }
  }, {
    tableName: 'products',
    timestamps: true
  });
};

