import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLBoolean } from "graphql";

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    approvedByAdmin: { type: GraphQLBoolean },
    bannedAt: { type: GraphQLString },
  }),
});

export default CompanyType;
