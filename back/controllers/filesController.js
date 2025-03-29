const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_BUCKET_NAME;

exports.uploadToS3 = async (
  buffer,
  filename,
  contentType = "application/pdf"
) => {
  console.log(
    `[S3] Uploading file: ${filename}, contentType: ${contentType}, size: ${buffer.length} bytes`
  );

  try {
    const params = {
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    };

    const data = await s3.upload(params).promise();
    console.log(
      `[S3] File uploaded successfully: ${filename}, URL: ${data.Location}`
    );
    return data.Location; // URL of the stored file
  } catch (error) {
    console.error(`[S3 ERROR] Upload failed for file ${filename}:`, error);
    throw error;
  }
};

exports.checkFileExistsInS3 = async (filename) => {
  console.log(`[S3] Checking if file exists: ${filename}`);

  const params = {
    Bucket: bucketName,
    Key: filename,
  };

  try {
    await s3.headObject(params).promise();
    console.log(`[S3] File exists: ${filename}`);
    return true;
  } catch (error) {
    if (error.code === "NotFound") {
      console.log(`[S3] File does not exist: ${filename}`);
      throw new Error("File not found");
    }
    console.error(`[S3 ERROR] Error checking file ${filename}:`, error);
    throw error;
  }
};

exports.getFileFromS3 = async (filename) => {
  console.log(`[S3] Getting file: ${filename}`);

  const params = {
    Bucket: bucketName,
    Key: filename,
  };

  try {
    const file = await s3.getObject(params).promise();
    console.log(
      `[S3] File retrieved successfully: ${filename}, size: ${file.Body.length} bytes`
    );
    return file.Body;
  } catch (error) {
    console.error(`[S3 ERROR] Failed to retrieve file ${filename}:`, error);
    throw new Error("File not found");
  }
};

exports.deleteFileFromS3 = async (filename) => {
  console.log(`[S3] Deleting file: ${filename}`);

  const params = {
    Bucket: bucketName,
    Key: filename,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`[S3] File deleted successfully: ${filename}`);
    return true;
  } catch (error) {
    console.error(`[S3 ERROR] Failed to delete file ${filename}:`, error);
    throw new Error("Error deleting file: " + error.message);
  }
};

exports.getS3FileUrl = (filename) => {
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
};
