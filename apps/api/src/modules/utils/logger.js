// Change to ES Modules and add the 'info' method
const logger = {
  info: (message, meta = "") => console.log(`[INFO] ${message}`, meta),
  log: (message) => console.log(message),
  error: (message, meta = "") => console.error(`[ERROR] ${message}`, meta),
};

export default logger;
