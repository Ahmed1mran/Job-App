import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
} from "graphql";

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    _id: { type: GraphQLID },
    userName: { type: GraphQLString },
    mobileNumber: { type: GraphQLString },
    bannedAt: { type: GraphQLString },
  }),
});

export default UserType;
