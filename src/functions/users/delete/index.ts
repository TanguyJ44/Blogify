import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'delete',
        path: 'users/{userId}',
        authorizer : {
          type: 'TOKEN',
          name : 'auth',
          identitySource: 'method.request.header.authorizationToken',
          resultTtlInSeconds: 0,
        },
        request: {
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
