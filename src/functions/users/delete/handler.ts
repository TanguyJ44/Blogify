import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

const deleteUser = async (event) => {
  const role = event.requestContext.authorizer?.role;
  if (role !== "admin") {
    return formatJSONResponse({
      message: "You are not authorized to delete a user !",
    });
  }

  const userId = event.pathParameters.userId;

  const params = {
    TableName: "Users",
    Key: {
      id: userId,
    },
  };

  try {
    await dynamoDb.delete(params).promise();
    return formatJSONResponse(
      {
        message: "User deleted successfully !",
        userId: userId,
      },
      200
    );
  } catch (error) {
    console.error("Error deleting user", error);
    return formatJSONResponse(
      {
        message: "Error deleting user !",
      },
      500
    );
  }
};

export const main = middyfy(deleteUser);
