import admin from "firebase-admin";
import * as dotenv from "dotenv";
dotenv.config();





try{
  
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  console.log("Firebase Key:", process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables.");
  }
  

  const serviceAccount = JSON.parse(serviceAccountKey.replace(/\n/g, "\\n"));
  // const serviceAccount = JSON.parse(serviceAccountKey);
  // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Project ID:",admin.app().options.projectId);

  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}

// export default admin;
