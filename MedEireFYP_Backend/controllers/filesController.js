import AWS from "aws-sdk";
import dotenv from "dotenv";
import { assumeRoleAndGetCredentials } from "../helpers/S3_Folders.js";
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.S3_USER,
  secretAccessKey: process.env.S3_KEY,
  region: process.env.REGION,
  version: "2010-12-01",
});

const s3 = new AWS.S3();

const S3_ViewFolders = async (req, res) => {
  let email = req.params.email;
  email = email.toString();
  const role = JSON.parse(req.query.role);
  let prefix = "";
  let s3Instance = "";
  let my_func = "";

  if (role && role.some((role) => role.roleId === 2)) {
    // If the role array contains an object with roleId equal to 1, set prefix to '/'
    prefix = "";
    const credentials = await assumeRoleAndGetCredentials(email);
    if (!credentials) {
      res.status(500).send("Error assuming role.");
      return;
    }

    s3Instance = new AWS.S3({
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
      region: process.env.REGION,
    });
    my_func = s3Instance;
  } else {
    // Otherwise, set prefix to `${email}/`
    prefix = `${email}/`;
    my_func = s3;
  }

  // List the objects in the S3 bucket with the given prefix
  my_func.listObjects(
    {
      Bucket: process.env.S3_NAME,
      Prefix: prefix,
    },
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error fetching files.");
        return;
      }

      // Map the objects to an array of file metadata with pre-signed URLs
      const files = data.Contents.map(async (file) => {
        const params = {
          Bucket: process.env.S3_NAME,
          Key: file.Key,
          Expires: 60 * 5, // Set the pre-signed URL to expire in 5 minutes
        };

        const signedUrl = s3.getSignedUrl("getObject", params);
        // Get the metadata for the file to retrieve the last modified date
        const metadata = await s3
          .headObject({ Bucket: process.env.S3_NAME, Key: file.Key })
          .promise();
        const dateModified = metadata.LastModified;

        return {
          name: file.Key.replace(prefix, ""),
          size: file.Size,
          url: signedUrl,
          dateModified: dateModified,
        };
      });

      Promise.all(files)
        .then((result) => {
          res.json(result);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send("Error fetching files.");
        });
    }
  );
};

const S3_uploadFiles = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const bucketName = process.env.S3_NAME;
  const fileData = req.file.buffer;
  const folderName = req.body.folderName;

  // Use SSE-S3 encryption
  const encryption = {
    SSE: "AES256",
  };

  try {
    // Upload the file to S3 with server-side encryption
    await s3
      .upload({
        Bucket: bucketName,
        Body: fileData,
        Key: `${folderName}/${req.file.originalname}`,
        ServerSideEncryption: encryption.SSE,
      })
      .promise();

    return res
      .status(200)
      .json({ msg: `File uploaded successfully: ${req.file.originalname}` });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Error uploading file" });
  }
};

export { S3_ViewFolders, S3_uploadFiles };
