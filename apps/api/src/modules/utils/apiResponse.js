export const success = (data, message = "Success") => ({
  success: true,
  message,
  data,
});

export const error = (message = "Error", status = 500) => ({
  success: false,
  message,
  status,
});

export default {
  success,
  error,
};
