import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.default`,
  events: [
    {
      s3: {
        bucket: 'task5-bucket',
        event: 's3:ObjectCreated:*',
        rules: [
            {
                prefix: 'uploaded/'
            }
        ],
        existing: true
      },
    },
  ],
};
