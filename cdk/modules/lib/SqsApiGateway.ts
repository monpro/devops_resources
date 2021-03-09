import * as cdk from '@aws-cdk/core';
import * as gateway from '@aws-cdk/aws-apigateway';
import * as sqs from '@aws-cdk/aws-sqs';
import * as iam from '@aws-cdk/aws-iam';

interface SqsApiGatewayProps extends cdk.StackProps {
  envName: string;
}

export class SqsApiGateway extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    sqsQueue: sqs.Queue,
    roles: iam.Role[],
    props?: SqsApiGatewayProps
  ) {
    super(scope, id, props);

    const apiGateway = new gateway.RestApi(this, 'sqsApiEndpoint', {
      deployOptions: {
        stageName: 'run',
        tracingEnabled: true,
      },
    });

    const queue = apiGateway.root.addResource('queue');
    roles.forEach((role) => {
      queue.addMethod(
        'GET',
        new gateway.AwsIntegration({
          service: 'sqs',
          path: `${cdk.Aws.ACCOUNT_ID}/${sqsQueue.queueName}`,
          integrationHttpMethod: 'POST',
          options: {
            credentialsRole: role,
            passthroughBehavior: gateway.PassthroughBehavior.NEVER,
            requestParameters: {
              'integration.request.header.Content-Type': `'application/x-www-form-urlencoded'`,
            },
            requestTemplates: {
              'application/json': `Action=SendMessage&MessageBody=$util.urlEncode("$method.request.querystring.message")`,
            },
            integrationResponses: [
              {
                statusCode: '200',
                responseTemplates: {
                  'application/json': '{"msg": success}',
                },
              },
            ],
          },
        }),
        {
          methodResponses: [
            {
              statusCode: '200',
            },
          ],
        }
      );
    });
  }
}
