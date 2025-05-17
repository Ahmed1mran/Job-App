export const isAdmin = (resolver) => {
  return async (parent, args, context, info) => {
    console.log("Context User:", context.user);
    if (!context.user || context.user.role !== "Admin") {
      throw new Error("Unauthorized! Only admins can perform this action.");
    }
    return resolver(parent, args, context, info);
  };
};
