export class CartRepository {
  constructor(models) {
    this.Cart = models.Cart || null;
    this.Product = models.Product;
  }

  async findByUserId(userId) {
    if (!this.Cart) return [];
    return this.Cart.findAll({
      where: { user_id: userId },
      include: [{ model: this.Product, as: 'product' }]
    });
  }

  async addItem(userId, productId, quantity = 1) {
    if (!this.Cart) return null;
    const existing = await this.Cart.findOne({ where: { user_id: userId, product_id: productId } });
    if (existing) {
      existing.quantity += quantity;
      return existing.save();
    }
    return this.Cart.create({ user_id: userId, product_id: productId, quantity });
  }

  async removeItem(userId, productId) {
    if (!this.Cart) return;
    return this.Cart.destroy({ where: { user_id: userId, product_id: productId } });
  }

  async clearCart(userId) {
    if (!this.Cart) return;
    return this.Cart.destroy({ where: { user_id: userId } });
  }
}

export default CartRepository;

