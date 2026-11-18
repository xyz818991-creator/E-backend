export class WishlistService {
  constructor(wishlistRepository) {
    this.wishlistRepo = wishlistRepository;
  }

  async getWishlist(userId) {
    return this.wishlistRepo.findByUserId(userId);
  }

  async addToWishlist(userId, productId) {
    return this.wishlistRepo.add(userId, productId);
  }

  async removeFromWishlist(userId, productId) {
    return this.wishlistRepo.remove(userId, productId);
  }
}

export default WishlistService;

