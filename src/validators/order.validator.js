export const validateOrder = (data) => {
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { error: 'Order must contain at least one item.' };
  }
  if (!data.shipping_address) {
    return { error: 'Shipping address is required.' };
  }
  return { error: null };
};

