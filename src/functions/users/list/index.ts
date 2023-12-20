import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "users",
        authorizer: {
          type: "TOKEN",
          name: "auth",
          identitySource: "method.request.header.authorizationToken",
          resultTtlInSeconds: 0,
        },
      },
    },
  ],
};
