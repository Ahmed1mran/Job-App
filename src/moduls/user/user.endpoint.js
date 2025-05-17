import { userRoles } from "../../midellware/auth.midellware.js";

export const endpoint = {
  profile: Object.values(userRoles),
};
