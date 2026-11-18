export class WishlistRepository {
  constructor(models) {
    this.Wishlist = models.Wishlist || null;
    this.Product = models.Product;
  }

  async findByUserId(userId) {
    if (!this.Wishlist) return [];
    return this.Wishlist.findAll({
      where: { user_id: userId },
      include: [{ model: this.Product, as: 'product' }]
    });
  }

  async add(userId, productId) {
    if (!this.Wishlist) return null;
    const existing = await this.Wishlist.findOne({ where: { user_id: userId, product_id: productId } });
    if (existing) return existing;
    return this.Wishlist.create({ user_id: userId, product_id: productId });
  }

  async remove(userId, productId) {
    if (!this.Wishlist) return;
    return this.Wishlist.destroy({ where: { user_id: userId, product_id: productId } });
  }
}

export default WishlistRepository;

