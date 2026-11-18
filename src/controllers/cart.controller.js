export const getCart = (models) => async (req, res) => {
  return res.json({ success: true, items: [] });
};

export const addToCart = (models) => async (req, res) => {
  return res.json({ success: true, message: 'Item added to cart.' });
};

export const updateCartItem = (models) => async (req, res) => {
  return res.json({ success: true, message: 'Cart updated.' });
};

export const removeFromCart = (models) => async (req, res) => {
  return res.json({ success: true, message: 'Item removed from cart.' });
};

