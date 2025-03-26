// import AWS from "aws-sdk";
// import multer from "multer";
// import multerS3 from "multer-s3";
// import path from "path";

// // Configure AWS SDK
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,       // Your AWS access key
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,   // Your AWS secret key
//   region: process.env.AWS_REGION,                     // e.g., "us-east-1"
// });

// const s3 = new AWS.S3();

// const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   // Accept images only
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files are allowed!"), false);
//   }
// };

// const upload = multer({
//   fileFilter,
//   storage: multerS3({
//     s3,
//     bucket: process.env.AWS_S3_BUCKET as string, // Name of your S3 bucket
//     acl: "public-read", // Adjust as needed; public-read makes the files accessible via URL
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       // Create a unique filename
//       const uniqueName = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
//       cb(null, uniqueName);
//     },
//   }),
// });

// export default upload;
