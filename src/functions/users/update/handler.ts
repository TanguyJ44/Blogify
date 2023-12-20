import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";
import bcrypt from "bcryptjs";
import schema from "./schema";

const dynamoDb = new DynamoDB.DocumentClient();

const updateUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const role = event.requestContext.authorizer?.role;
  if (role !== "admin") {
    return formatJSONResponse({
      message: "You are not authorized to update a user !",
    });
  }

  const userId = event.pathParameters.userId;
  const userData = event.body;

  const updateParams = {
    TableName: "Users",
    Key: {
      id: userId,
    },
    UpdateExpression:
      "set #name = :name, #email = :email, #password = :password, #role = :role",
    ExpressionAttributeValues: {
      ":name": userData.name,
      ":email": userData.email,
      ":password": bcrypt.hashSync(userData.password, 10),
      ":role": userData.role || "user",
    },
    ExpressionAttributeNames: {
      "#name": "name",
      "#email": "email",
      "#password": "password",
      "#role": "role",
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    await dynamoDb.update(updateParams).promise();
    return formatJSONResponse(
      {
        message: "User updated successfully!",
        userId: userId,
      },
      200
    );
  } catch (error) {
    console.error("Error updating user", error);
    return formatJSONResponse(
      {
        message: "Error updating user!",
      },
      500
    );
  }
};

export const main = middyfy(updateUser);
