import XLSX from "xlsx";
import fs from "fs";
import * as dbservice from "../../DB/db.service.js"; // استبدلها بمسار الخدمة اللي عندك
import applicationModel from "../../DB/models/Application.Collection.js"; // استبدلها بالموديل الصحيح
import { asyncHandler } from "../../utils/error/error.js";
import ExcelJS from "exceljs";
import companyModel from "../../DB/models/Company.Collection.js";


export const endpoint = asyncHandler(async (req, res, next) => {
  const { companyId, date } = req.params;
  
  // التأكد من وجود الشركة
  const company = await companyModel.findById(companyId);
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  
  // تحويل التاريخ إلى بداية ونهاية اليوم
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);
  
  // جلب الطلبات التي تم إنشاؤها في ذلك اليوم
  const applications = await applicationModel.find({
    companyId,
    createdAt: { $gte: startDate, $lt: endDate }
  }).populate("userId").lean();
  
  // إنشاء ملف Excel باستخدام ExcelJS
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Applications");
  
  worksheet.columns = [
    { header: "Application ID", key: "id", width: 25 },
    { header: "User Name", key: "userName", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Application Date", key: "createdAt", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "CV URL", key: "cvUrl", width: 50 }
  ];
  
  applications.forEach(app => {
    worksheet.addRow({
      id: app._id.toString(),
      userName: app.userId ? app.userId.userName : "N/A",
      email: app.userId ? app.userId.email : "N/A",
      createdAt: new Date(app.createdAt).toISOString(),
      status: app.status,
      cvUrl: app.userCV ? app.userCV.secure_url : "N/A"
    });
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=applications_${company.companyName}_${date}.xlsx`
  );
  res.send(buffer);
})






  