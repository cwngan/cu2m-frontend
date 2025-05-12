// Validation utilities
export const validateUsername = (username: string): boolean => {
  const regex = /^[a-zA-Z0-9_]{5,20}$/;
  return regex.test(username);
};

export const validatePassword = (password: string): boolean => {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password)
  );
};