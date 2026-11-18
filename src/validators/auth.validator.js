export const validateLogin = (data) => {
  if (!data.email || !data.password) {
    return { error: 'Email and password are required.' };
  }
  return { error: null };
};

export const validateRegister = (data) => {
  if (!data.name || !data.email || !data.password) {
    return { error: 'Name, email, and password are required.' };
  }
  if (data.password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }
  return { error: null };
};

