export class ProductRepository {
  constructor(models) {
    this.models = models;
    this.Product = models.Product;
    this.Category = models.Category;
    this.ProductImage = models.ProductImage;
  }

  async findAll(options = {}) {
    return this.Product.findAll({
      include: [
        { model: this.Category, as: 'category' },
        { model: this.ProductImage, as: 'images' }
      ],
      ...options
    });
  }

  async findById(id) {
    return this.Product.findByPk(id, {
      include: [
        { model: this.Category, as: 'category' },
        { model: this.ProductImage, as: 'images' }
      ]
    });
  }

  async findBySlug(slug) {
    return this.Product.findOne({
      where: { slug },
      include: [
        { model: this.Category, as: 'category' },
        { model: this.ProductImage, as: 'images' }
      ]
    });
  }

  async create(data) {
    return this.Product.create(data);
  }

  async update(id, data) {
    return this.Product.update(data, { where: { id } });
  }

  async delete(id) {
    return this.Product.destroy({ where: { id } });
  }
}

export default ProductRepository;

