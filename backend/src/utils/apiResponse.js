export function sendSuccess(res, data = null, message = "Success", statusCode = 200, meta = undefined) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendCreated(res, data, message = "Created") {
  return sendSuccess(res, data, message, 201);
}
