import * as cdk from '@aws-cdk/core';
import * as Lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';

export class LambdaDockerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const dockerFile = path.join(__dirname, './');
    new Lambda.DockerImageFunction(this, 'DockerLambda-Test-Function', {
      code: Lambda.DockerImageCode.fromImageAsset(dockerFile),
    });
  }
}
