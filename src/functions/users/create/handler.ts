import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 as uuidv4 } from "uuid";
import { DynamoDB } from "aws-sdk";
import bcrypt from "bcryptjs";
import schema from "./schema";

const dynamoDb = new DynamoDB.DocumentClient();

const createUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const userData = event.body;

  const user = {
    id: uuidv4(),
    name: userData.name,
    email: userData.email,
    password: bcrypt.hashSync(userData.password, 10),
    role: "user",
  };

  const params = {
    TableName: "Users",
    Item: user,
  };

  try {
    await dynamoDb.put(params).promise();
    return formatJSONResponse(
      {
        message: "New user created successfully !",
        userId: user.id,
      },
      201
    );
  } catch (error) {
    console.error("Error creating user", error);
    return formatJSONResponse(
      {
        message: "Error creating user !",
      },
      500
    );
  }
};

export const main = middyfy(createUser);
