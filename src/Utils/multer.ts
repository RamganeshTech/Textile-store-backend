// // middleware/multer.ts
// import multer from 'multer';
// import path from 'path';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "temp_uploads/"); // your specific folder
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
//   }
// });

// export const upload = multer({ storage });


import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Determine the absolute path for the uploads folder
const uploadFolder = path.join(process.cwd(), "temp_uploads");

// Ensure the folder exists; if not, create it
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the absolute path for the destination
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({ storage });
