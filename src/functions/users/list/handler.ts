import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

const listUser = async (event) => {
  const role = event.requestContext.authorizer?.role;
  if (role !== "admin") {
    return formatJSONResponse({
      message: "You are not authorized to list users !",
    });
  }

  const params = {
    TableName: "Users",
  };

  try {
    const users = await dynamoDb.scan(params).promise();
    return formatJSONResponse({
      message: "Users retrieved successfully !",
      users: users.Items.map((user) => {
        delete user.password;
        return user;
      }),
    });
  } catch (error) {
    console.error("Error retrieving users !", error.message);
    return formatJSONResponse(
      {
        message: "Error retrieving users !",
      },
      500
    );
  }
};

export const main = middyfy(listUser);
