import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

const getUser = async (event) => {
  const role = event.requestContext.authorizer?.role;
  if (role !== "admin") {
    return formatJSONResponse({
      message: "You are not authorized to get a user !",
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
    const user = await dynamoDb.get(params).promise();
    if (!user.Item) {
      return formatJSONResponse(
        {
          message: "User not found!",
          userId: userId,
        },
        404
      );
    }

    user.Item.password = undefined;

    return formatJSONResponse(
      {
        message: "User retrieved successfully!",
        user: user.Item,
      },
      200
    );
  } catch (error) {
    console.error("Error retrieving the user", error);
    return formatJSONResponse(
      {
        message: "Error retrieving the user!",
      },
      500
    );
  }
};

export const main = middyfy(getUser);
