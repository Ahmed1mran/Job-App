import * as dbService from '../DB/db.service.js'
/*
export const paginate = async ({
  model,
  populate = [],
  filter = {},
  select = "",
} = {}) => {
//   let { page, size } = req.query;
//   page = parseInt(page < 1 ? process.env.PAGE : page);
//   size = parseInt(size < 1 ? process.env.SIZE : size);
  // const skip = (page - 1) * size;
  const count = await model.find(filter).countDocuments();
  const data = await dbService.find({
    model: model,
    filter,
    populate,
    select,
    // skip,
    // limit: size,
  });

  return { data };
};
*/
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
