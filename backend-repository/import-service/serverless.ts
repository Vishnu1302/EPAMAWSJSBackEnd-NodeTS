import type { AWS } from '@serverless/typescript';
import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      BUCKET_NAME: 'task5-bucket',
      QUEUE_NAME: 'catalogItemsQueue',
      AUTH_FUNC_NAME: 'arn:aws:lambda:us-east-1:314276015768:function:authorization-service-dev-basicAuthorizer'
    },
    iam: {
      role: {
        statements: [{
          Effect: "Allow",
          Action: ["s3:*"],
          Resource: [
            'arn:aws:s3:::task5-bucket',
            'arn:aws:s3:::task5-bucket/*',
          ],
        },
        {
            Effect: 'Allow',
            Action: 'sqs:*',
            Resource: {
              'Fn::Sub': 'arn:aws:sqs:${self:provider.region}:${AWS::AccountId}:${self:provider.environment.QUEUE_NAME}'
            }
          }]
      }
    },
    
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
        GatewayResponseUnauthorized: {
            Type: 'AWS::ApiGateway::GatewayResponse',
            Properties: {
                ResponseParameters: {
                    'gatewayresponse.header.WWW-Authenticate': "'Basic'",
                    'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                    'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
                },
                RestApiId: {
                    Ref: 'ApiGatewayRestApi'
                },
                ResponseType: 'UNAUTHORIZED',
                StatusCode: '401'
            }
        },
        GatewayResponseForbidden: {
            Type: 'AWS::ApiGateway::GatewayResponse',
            Properties: {
                ResponseParameters: {
                    'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                    'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
                },
                RestApiId: {
                    Ref: 'ApiGatewayRestApi'
                },
                ResponseType: 'ACCESS_DENIED',
                StatusCode: '403'
            }
        }
    }
  }
};

module.exports = serverlessConfiguration;
