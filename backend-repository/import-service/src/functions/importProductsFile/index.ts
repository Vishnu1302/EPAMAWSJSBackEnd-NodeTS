import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.default`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        cors: true,
        request: {
            parameters: {
                querystrings : {
                    name: true
                }
            }
        },
        authorizer: {
          arn: '${self:provider.environment.AUTH_FUNC_NAME}',
          type: 'token',

        }
      },
    },
  ],
};
