import { asyncHandler } from "../../utils/error/error.js";
import userModel from "../../DB/models/User.Collection.js";
import * as dbsearvice from "../../DB/db.service.js";
import companyModel from "../../DB/models/Company.Collection.js";
export const checkHRorOwner = () => {
  return asyncHandler(async (req, res, next) => {
    const { receiverId } = req.body;
    const currentUserId = req.user._id;
    const {companyId}=req.params
    const receiver = await dbsearvice.findOne({
      model: userModel,
      filter: { _id: receiverId },
    });
    console.log("Receiver ID:", receiverId);

    console.log(receiver);
    if (!receiver) {
      return next(new Error("User not found", { cause: 404 }));
    }
    const whoCanStartConversation = await dbsearvice.findOne({
      model:companyModel,
      filter:{_id:companyId}
    })
    if (
      req.user._id.toString() !== whoCanStartConversation.createdBy.toString() &&
      !whoCanStartConversation.HRs.includes(req.user._id.toString())
    ){
      return next(
        new Error("Only HRs or company owners can start a conversation", {
          cause: 403,
        })
      );
    }

    next();
  });
};
