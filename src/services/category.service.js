export class CategoryService {
  constructor(categoryRepository) {
    this.categoryRepo = categoryRepository;
  }

  async getAllCategories() {
    return this.categoryRepo.findAll({ where: { is_active: true } });
  }

  async getCategoryBySlug(slug) {
    const cat = await this.categoryRepo.findBySlug(slug);
    if (!cat) throw new Error('Category not found.');
    return cat;
  }

  async createCategory(data) {
    return this.categoryRepo.create(data);
  }

  async updateCategory(id, data) {
    await this.categoryRepo.update(id, data);
    return this.categoryRepo.findById(id);
  }

  async deleteCategory(id) {
    return this.categoryRepo.delete(id);
  }
}

export default CategoryService;

