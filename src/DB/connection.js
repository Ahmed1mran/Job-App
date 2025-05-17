import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose
    .connect(process.env.DB_URI)
    .then((res) => {
      console.log(`DB Connected`);
    })
    .catch((err) => {
      console.error(`Fail to Connect`);
    });
};
export default connectDB;
