import { GraphQLNonNull, GraphQLString } from "graphql";
import { authorization } from "../../midellware/auth.midellware.js";
import { getProfile } from "./service/user.graph.js";
import { getProfileResponse } from "./types/user.types.js";

export const query = {
  getProfile: {
    type: getProfileResponse,
    args: {
      authorization: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: getProfile,
  },
};
