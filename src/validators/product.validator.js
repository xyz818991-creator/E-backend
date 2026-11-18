export const validateProduct = (data) => {
  if (!data.name) return { error: 'Product name is required.' };
  if (!data.selling_price) return { error: 'Product selling price is required.' };
  return { error: null };
};

