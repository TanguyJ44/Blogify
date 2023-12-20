import type { AWS } from "@serverless/typescript";

import auth from "@functions/auth";
import login from "@functions/login";
import createUser from "@functions/users/create";
import getUser from "@functions/users/get";
import listUser from "@functions/users/list";
import updateUser from "@functions/users/update";
import deleteUser from "@functions/users/delete";

const serverlessConfiguration: AWS = {
  service: "blogify",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
    region: "eu-west-3",
    apiName: "blogify-api",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
        Resource: [
          "arn:aws:dynamodb:eu-west-3:*:table/Users",
          "arn:aws:dynamodb:eu-west-3:*:table/Users/index/EmailIndex",
        ],
      },
    ],
  },
  functions: {
    auth,
    login,
    createUser,
    getUser,
    listUser,
    updateUser,
    deleteUser,
  },
  resources: {
    Resources: {
      UsersTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "Users",
          AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "email", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
          GlobalSecondaryIndexes: [
            {
              IndexName: "EmailIndex",
              KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
              Projection: {
                ProjectionType: "ALL",
              },
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node16",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
