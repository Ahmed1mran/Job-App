import { GraphQLList } from "graphql";
import CompanyType from "../types/CompanyType.js";
import companyModel from "../../../DB/models/Company.Collection.js";

export const getAllCompanies = {
  type: new GraphQLList(CompanyType),
  resolve: async () => {
    return await companyModel.find();
  },
};
