import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { imageType } from "../../../utils/app.types.shared.js";

export const oneUserType = {
  _id: { type: GraphQLID },
  firstName: { type: GraphQLString },
  lastName: { type: GraphQLString },
  email: { type: GraphQLString },
  password: { type: GraphQLString },
  image: { type: imageType },
  phone: { type: GraphQLString },
  confirmEmail: { type: GraphQLBoolean },
  confirmEmailOTP: { type: GraphQLString },

  gender: {
    type: new GraphQLEnumType({
      name: "genderTypes",
      values: {
        male: { type: GraphQLString },
        female: { type: GraphQLString },
      },
    }),
  },
  resetPasswordOTP: { type: GraphQLString },
  code: { type: GraphQLString },
  address: { type: GraphQLString },
  tempEmail: { type: GraphQLString },
  tempEmailOTP: { type: GraphQLString },
  DOB: { type: GraphQLString },

  coverImages: { type: new GraphQLList(imageType) },

  provider: {
    type: new GraphQLEnumType({
      name: "providerTypes",
      values: {
        system: { type: GraphQLString },
        google: { type: GraphQLString },
      },
    }),
  },

  role: {
    type: new GraphQLEnumType({
      name: "roleTypes",
      values: {
        Admin: { type: GraphQLString },
        superAdmin: { type: GraphQLString },
        User: { type: GraphQLString },
      },
    }),
  },
  changeCredentialsTime: { type: GraphQLString },
  isDeleted: { type: GraphQLString },
};

export const oneUserResponse = new GraphQLObjectType({
  name: "oneUserResponse",
  fields: {
    ...oneUserType,
    viewers: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "viwersList",
          fields: {
            ...oneUserType,
          },
        })
      ),
    },
    updatedBy: { type: GraphQLID },
  },
});
export const getProfileResponse = new GraphQLObjectType({
  name: "getProfileResponse",
  fields: {
    message: { type: GraphQLString },
    statusCode: { type: GraphQLInt },
    data: { type: oneUserResponse },
  },
});
