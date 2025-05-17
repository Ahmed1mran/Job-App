import { GraphQLList } from "graphql";
import UserType from "../types/UserType.js";
import userModel from "../../../DB/models/User.Collection.js";

export const getAllUsers = {
  type: new GraphQLList(UserType),
  resolve: async () => {
    return await userModel.find();
  },
};
