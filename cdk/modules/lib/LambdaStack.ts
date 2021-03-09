import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as gateway from '@aws-cdk/aws-apigateway';

interface LambdaStackProps extends cdk.StackProps {
  envName: string;
}

export class LambdaStack extends cdk.Stack {
  private readonly lambdaFunction: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.lambdaFunction = new lambda.Function(this, 'testFunction', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset('resource'),
      handler: 'test.handler',
    });

    const apiGateway = new gateway.LambdaRestApi(this, 'testFunctionGateway', {
      handler: this.lambdaFunction,
      restApiName: 'lambdaApiGateway',
    });
  }
}
