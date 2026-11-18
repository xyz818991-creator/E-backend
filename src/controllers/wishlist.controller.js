export const getWishlist = (models) => async (req, res) => {
  return res.json({ success: true, items: [] });
};

export const addToWishlist = (models) => async (req, res) => {
  return res.json({ success: true, message: 'Item added to wishlist.' });
};

export const removeFromWishlist = (models) => async (req, res) => {
  return res.json({ success: true, message: 'Item removed from wishlist.' });
};

