export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      const err = new Error(error.message || "Something went wrong");
      err.cause = error.cause || 500;
      next(err);
    });
  };
};


export const globalErrorHandling = (error, req, res, next) => {
  console.log("💥 ERROR LOGGED:", error); // 🛠️ يساعد في التحقق من الخطأ

  if (!res || !res.status) {
    console.error("Response object is undefined!"); // تحقق من `res`
    return;
  }

  if (!error) {
    error = new Error("Unknown error occurred");
    error.cause = 500;
  }

  return res.status(error.cause || 500).json({
    msg: error.message || "An error occurred",
    stack: process.env.MOOD === "DEV" ? error.stack : undefined,
  });
};
