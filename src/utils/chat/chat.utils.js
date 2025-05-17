export const isAuthorizedToChat = (user) => {
    return user.role === "HR" || user.role === "Owner";
  };
  