import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { getAllUsers } from "./queries/userQueries.js";
import { getAllCompanies } from "./queries/companyQueries.js";
import { banUser, unbanUser } from "./mutations/userMutations.js";
import { approveCompany } from "./mutations/companyMutations.js";

const schema = new GraphQLSchema({
  query:new GraphQLObjectType({
    name : "RootQuery",
    description:"main applicaion query",
    fields:{
      getAllUsers,
      getAllCompanies, 
    }
  }),
  mutation:new GraphQLObjectType({
    name: "Mutation",
    fields: {
      banUser,
      unbanUser,
      approveCompany,
    }
  })
})
export default schema
