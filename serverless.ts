import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'ignite-certificate',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['dynamodb:*'],
        Resource: ['*']
      }
    ]
  },
  // import the function via paths
  functions: {
    generateCertificate: {
      handler: 'src/functions/generateCertificate.handler',
      events: [
        {
          http: {
            path: 'generateCertificate',
            method: 'post',
            cors: true
          },
        },
      ],
    }
  },
  package: { individually: false },
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
    dynamodb: {
      stages: ['dev', 'local'],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
    },
  },
  resources: {
    Resources: {
      UsersCertificatesDB: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'users_certificates',
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S', // S for string
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
        }
      }
    }
  },
};

module.exports = serverlessConfiguration;
