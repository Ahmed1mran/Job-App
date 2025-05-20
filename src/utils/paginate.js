import * as dbService from "../DB/db.service.js";

export const paginate = async ({
  model,
  populate = [],
  filter = {},
  select = "",
  page = 1,
  limit = 10,
} = {}) => {
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  const count = await model.countDocuments(filter);
  const data = await dbService.find({
    model,
    filter,
    populate,
    select,
    skip,
    limit,
  });

  return { data, total: count, page, limit };
};
