const responsePayload = (statusCode, message, data, res) => {
  res.status(statusCode).json({
    payload: {
      status_code: statusCode,
      message: message,
      data: data,
    },
  });
};
module.exports = responsePayload;
