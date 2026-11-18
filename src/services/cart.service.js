export class CartService {
  constructor(cartRepository) {
    this.cartRepo = cartRepository;
  }

  async getCart(userId) {
    return this.cartRepo.findByUserId(userId);
  }

  async addToCart(userId, productId, quantity = 1) {
    return this.cartRepo.addItem(userId, productId, quantity);
  }

  async removeFromCart(userId, productId) {
    return this.cartRepo.removeItem(userId, productId);
  }

  async clearCart(userId) {
    return this.cartRepo.clearCart(userId);
  }
}

export default CartService;

