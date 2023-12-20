import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as jwt from "jsonwebtoken";
import { DynamoDB } from "aws-sdk";
import bcrypt from "bcryptjs";
import schema from "./schema";

const dynamoDb = new DynamoDB.DocumentClient();

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { email, password } = event.body;

  const params = {
    TableName: "Users",
    IndexName: "EmailIndex",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  try {
    const result = await dynamoDb.query(params).promise();

    if (result.Items.length === 0) {
      return formatJSONResponse(
        {
          message: "Username or password incorrect !",
        },
        401
      );
    }

    const user = result.Items[0];
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return formatJSONResponse(
        {
          message: "Username or password incorrect !",
        },
        401
      );
    }

    const token = jwt.sign(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      "123456789",
      {
        expiresIn: "1h",
      }
    );

    return formatJSONResponse(
      {
        message: "Login successful !",
        token: token,
        expiresIn: 3600,
      },
      200
    );
  } catch (error) {
    console.error("Login error", error);
    return formatJSONResponse(
      {
        message: "Login error !",
      },
      500
    );
  }
};

export const main = middyfy(login);
