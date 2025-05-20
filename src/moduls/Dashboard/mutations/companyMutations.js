import { GraphQLString, GraphQLNonNull, GraphQLBoolean } from "graphql";
import CompanyType from "../types/CompanyType.js";
import companyModel from "../../../DB/models/Company.Collection.js";
import { isAdmin } from "../../../midellware/graphQL.Midellware/graphQL.Midellware.js";

export const approveCompany = {
  type: CompanyType,
  args: { companyId: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: isAdmin(async (_, { companyId }) => {
    console.log("Company ID:", companyId);
    const company = await companyModel.findById(companyId);
    console.log("Found Company:", company);
    if (!company) {
      throw new Error("Company not found");
    }
    return await companyModel.findByIdAndUpdate(
      companyId,
      { approvedByAdmin: true },
      { new: true }
    );
  }),
};
