export class CategoryRepository {
  constructor(models) {
    this.Category = models.Category;
  }

  async findAll(options = {}) {
    return this.Category.findAll({
      order: [['display_order', 'ASC'], ['name', 'ASC']],
      ...options
    });
  }

  async findById(id) {
    return this.Category.findByPk(id);
  }

  async findBySlug(slug) {
    return this.Category.findOne({ where: { slug } });
  }

  async create(data) {
    return this.Category.create(data);
  }

  async update(id, data) {
    return this.Category.update(data, { where: { id } });
  }

  async delete(id) {
    return this.Category.destroy({ where: { id } });
  }
}

export default CategoryRepository;

