import type { AWS } from '@serverless/typescript';

import getProductsListTS from '@functions/getProductsList';
import getProductByIdTS from '@functions/getProductByID';
import createProductTS from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-auto-swagger', 'serverless-offline'],
  provider: {
    name: 'aws',
    region: 'us-east-1',
    stage: 'dev',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["sqs:*"],
            Resource: {
              "Fn::GetAtt": ["catalogItemsQueue", "Arn"]
            }
          },
          {
            Effect: "Allow",
            Action: ["sns:*"],
            Resource: {
              Ref: 'createProductTopic'
            }
          }
        ]
      }
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      TABLE_PRODUCTS: 'products',
      TABLE_STOCKS: 'stocks',
      TOPIC_NAME: 'createProductTopic',
      TOPIC_ARN: 'arn:aws:sns:${self:provider.region}:314276015768:${self:provider.environment.TOPIC_NAME}'
    },
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        }
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic'
        }
      },
      createProductSNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          TopicArn: { Ref: 'createProductTopic' },
          Endpoint: 'vishnudeekshit@gmail.com',
          Protocol: 'email'
        }
      },
      createFilteredProductSNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          TopicArn: { Ref: 'createProductTopic' },
          Endpoint: 'vishnu.krakow@gmail.com',
          Protocol: 'email',
          FilterPolicyScope: 'MessageBody',
          FilterPolicy: '{"price":[{"numeric":[">=",30]}]}'
        }
      },
    }
  },
  // import the function via paths
  functions: { getProductsListTS, getProductByIdTS, createProductTS, catalogBatchProcess },
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
};

module.exports = serverlessConfiguration;
