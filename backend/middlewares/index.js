function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
}

function notFound(req, res) {
  res.status(404).json({ error: "Không tìm thấy API", details: [] });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    return res.status(400).json({ error: "Dữ liệu không hợp lệ", details });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return res.status(409).json({
      error: "Giá trị đã tồn tại",
      details: [{ field, message: `${field} không được trùng` }],
    });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "JSON không hợp lệ", details: [] });
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({
    error: status >= 500 ? "Lỗi máy chủ" : error.message,
    details: error.details || [],
  });
}

module.exports = { requestLogger, notFound, errorHandler };
