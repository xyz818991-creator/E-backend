export const validatePayment = (data) => {
  if (!data.amount || parseFloat(data.amount) <= 0) {
    return { error: 'Valid payment amount is required.' };
  }
  return { error: null };
};

