import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.S3_USER,
  secretAccessKey: process.env.S3_KEY,
  region: process.env.REGION,
  version: "2010-12-01",
});

const s3 = new AWS.S3();
const iam = new AWS.IAM();
const sts = new AWS.STS();

const S3_CreateFolders = async ({ email }) => {
  email = email.toString();
  const folderName = `${email}/`;

  try {
    const headParams = {
      Bucket: process.env.S3_NAME,
      Key: folderName,
    };

    // Check if folder already exists
    await s3.headObject(headParams).promise();
    return;
  } catch (error) {
    if (error.code !== "NoSuchKey" && error.code !== "NotFound") {
      console.log(`Error checking if folder exists: ${error}`);
      return;
    }

    // Folder does not exist - create it
    try {
      const data = await s3
        .putObject({
          Bucket: process.env.S3_NAME,
          Key: folderName,
        })
        .promise();
    } catch (error) {
      console.log("Error creating folder:", error);
    }
  }
};

const S3_RenameFolder = async (newEmail, email) => {
  const oldFolderName = `${email}/`;
  const newFolderName = `${newEmail}/`;

  try {
    // List objects in old folder
    const data = await s3
      .listObjects({ Bucket: process.env.S3_NAME, Prefix: oldFolderName })
      .promise();
    const objects = data.Contents;

    // Copy each object to new folder
    for (const object of objects) {
      const objectKey = object.Key.replace(oldFolderName, "");
      await s3
        .copyObject({
          Bucket: process.env.S3_NAME,
          CopySource: `${process.env.S3_NAME}/${object.Key}`,
          Key: `${newFolderName}${objectKey}`,
        })
        .promise();
    }
  } catch (error) {
    console.log("Error renaming folder:", error);
  }
};

const S3_DeleteFoldersAndFiles = async (email) => {
  const bucketName = process.env.S3_NAME;
  const folderName = email;

  try {
    const data = await s3
      .listObjects({
        Bucket: bucketName,
        Prefix: `${folderName}/`,
      })
      .promise();

    const objects = data.Contents.map((obj) => {
      return { Key: obj.Key };
    });

    await s3
      .deleteObjects({
        Bucket: bucketName,
        Delete: { Objects: objects },
      })
      .promise();

    await s3
      .deleteObject({
        Bucket: bucketName,
        Key: `${folderName}/`,
      })
      .promise();
  } catch (error) {
    console.log(error);
  }
};

const S3_CreateIAMUserAndPolicy = async ({ email }) => {
  email = email.toString();
  const folderName = `${email}/`;

  // Check if user already exists
  try {
    const getUserParams = {
      UserName: email,
    };

    await iam.getUser(getUserParams).promise();
    return;
  } catch (error) {
    // User does not exist - create it
    const createUserParams = {
      UserName: email,
    };

    try {
      const userData = await iam.createUser(createUserParams).promise();
    } catch (error) {
      console.log("Error creating IAM user:", error);
      return;
    }
  }

  // Create and attach user policy
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["s3:GetObject", "s3:ListBucket"],
        Resource: [`arn:aws:s3:::${process.env.S3_NAME}/${folderName}*`],
      },
    ],
  };

  const policyParams = {
    PolicyDocument: JSON.stringify(policy),
    PolicyName: `user-policy-${email}`,
    UserName: email,
  };

  try {
    const policyData = await iam.putUserPolicy(policyParams).promise();
  } catch (error) {
    console.log("Error creating user policy:", error);
  }
};

const deleteIAMUserAndPolicy = async (email) => {
  // Delete user policy
  const listPolicyParams = {
    UserName: email,
  };

  try {
    const policyNames = await iam.listUserPolicies(listPolicyParams).promise();
    for (const policyName of policyNames.PolicyNames) {
      const policyParams = {
        PolicyName: policyName,
        UserName: email,
      };

      await iam.deleteUserPolicy(policyParams).promise();
    }
  } catch (error) {
    console.log("Error deleting user policies:", error);
  }

  // Delete IAM user
  const userParams = {
    UserName: email,
  };

  try {
    await iam.deleteUser(userParams).promise();
  } catch (error) {
    console.log("Error deleting IAM user:", error);
  }
};

const createIAMDoctorAndPolicy = async (email) => {
  // Create and attach Doctor policy
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["s3:GetObject", "s3:ListBucket", "s3:PutObject"],
        Resource: [
          `arn:aws:s3:::${process.env.S3_NAME}/*`,
          `arn:aws:s3:::${process.env.S3_NAME}`,
        ],
      },
    ],
  };

  const policyParams = {
    PolicyDocument: JSON.stringify(policy),
    PolicyName: `doctor-policy-${email}`,
    UserName: email,
  };

  try {
    const policyData = await iam.putUserPolicy(policyParams).promise();
  } catch (err) {
    console.log("Error creating doctor policy:", err);
    return;
  }
  return true;
};

const deleteDoctorPolicy = async (email) => {
  // Get the policy name
  const policyName = `doctor-policy-${email}`;

  // Check if the policy exists
  const listUserPoliciesParams = {
    UserName: email,
  };

  try {
    const policies = await iam
      .listUserPolicies(listUserPoliciesParams)
      .promise();
    const policyExists = policies.PolicyNames.includes(policyName);

    if (!policyExists) {
      return;
    }
  } catch (err) {
    console.log("Error listing user policies:", err);
    return;
  }

  // Detach policy from user
  const deleteUserPolicyParams = {
    PolicyName: policyName,
    UserName: email,
  };

  try {
    await iam.deleteUserPolicy(deleteUserPolicyParams).promise();
  } catch (err) {
    console.log("Error deleting doctor policy:", err);
    return;
  }

  return true;
};

const assumeRoleAndGetCredentials = async (email) => {
  const roleToAssume = {
    RoleArn: `arn:aws:iam::507045827874:role/Doctor-Role`,
    RoleSessionName: `${email}-session`,
    DurationSeconds: 3600, // The duration of the temporary credentials in seconds
  };

  try {
    const { Credentials } = await sts.assumeRole(roleToAssume).promise();
    return Credentials;
  } catch (error) {
    console.error("Error assuming role:", error);
    return null;
  }
};

export {
  S3_CreateFolders,
  S3_RenameFolder,
  S3_DeleteFoldersAndFiles,
  S3_CreateIAMUserAndPolicy,
  deleteIAMUserAndPolicy,
  createIAMDoctorAndPolicy,
  deleteDoctorPolicy,
  assumeRoleAndGetCredentials,
};
