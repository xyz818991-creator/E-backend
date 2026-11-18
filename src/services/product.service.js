export class ProductService {
  constructor(productRepository) {
    this.productRepo = productRepository;
  }

  async getAllProducts(query = {}) {
    const where = {};
    if (query.category_id) where.category_id = query.category_id;
    if (query.is_featured !== undefined) where.is_featured = query.is_featured === 'true' || query.is_featured === true;
    where.is_published = true;

    return this.productRepo.findAll({ where });
  }

  async getProductById(id) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new Error('Product not found.');
    return product;
  }

  async getProductBySlug(slug) {
    const product = await this.productRepo.findBySlug(slug);
    if (!product) throw new Error('Product not found.');
    return product;
  }

  async createProduct(data) {
    return this.productRepo.create(data);
  }

  async updateProduct(id, data) {
    await this.productRepo.update(id, data);
    return this.productRepo.findById(id);
  }

  async deleteProduct(id) {
    return this.productRepo.delete(id);
  }
}

export default ProductService;

