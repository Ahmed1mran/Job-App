import { GraphQLString, GraphQLNonNull } from "graphql";
import UserType from "../types/UserType.js";
import userModel from "../../../DB/models/User.Collection.js";

export const banUser = {
  type: UserType,
  args: { userId: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: async (_, { userId }) => {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.bannedAt) {
      throw new Error("user already banned");
      
    }
    return await userModel.findByIdAndUpdate(userId, { bannedAt: new Date().toISOString() }, { new: true });

  }
};

export const unbanUser = {
  type: UserType,
  args: { userId: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: async (_, { userId }) => {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.bannedAt) {
      throw new Error("user already not banned");
      
    }
    return await userModel.findByIdAndUpdate(userId, { bannedAt: null }, { new: true });
  },
};
