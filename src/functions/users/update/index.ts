import { handlerPath } from "@libs/handler-resolver";
import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "put",
        path: "users/{userId}",
        authorizer: {
          type: "TOKEN",
          name: "auth",
          identitySource: "method.request.header.authorizationToken",
          resultTtlInSeconds: 0,
        },
        request: {
          schemas: {
            "application/json": schema,
          },
          parameters: {
            paths: {
              userId: true,
            },
          },
        },
      },
    },
  ],
};
