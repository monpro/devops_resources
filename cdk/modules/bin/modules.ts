#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcStack } from '../lib/VpcStack';
import { SecurityStack } from '../lib/SecurityStack';
import { BastionHostStack } from '../lib/BastionHostStack';
import { KmsStack } from '../lib/KmsStack';
import { LambdaS3Stack } from '../lib/LambdaS3Stack';
import * as s3 from '@aws-cdk/aws-s3';
import { RdsStack } from '../lib/RdsStack';
import { RedisStack } from '../lib/RedisStack';
import { CognitoStack } from '../lib/CognitoStack';
import { ApiGatewayStack } from '../lib/ApiGatewayStack';
import { LambdaStack } from '../lib/LambdaStack';
import { SqsStack } from '../lib/SqsStack';
import { SqsApiGateway } from '../lib/SqsApiGateway';
import { SqsSnsStack } from '../usecase/SqsSnsStack';
import { CodePipelineBackend } from '../lib/CodePipelineBackend';
import { ArtifactS3Stack } from '../lib/ArtifactS3Stack';
import StepFunctionStack from '../lib/stepfunction';
import LambdaDockerStack from '../lib/lambdadocker';

const app = new cdk.App();
const { vpc } = new VpcStack(app, 'VpcStack', {
  envName: 'dev',
});

const { lambdaSg, bastionSg } = new SecurityStack(app, 'SecurityStack', vpc, {
  envName: 'dev',
});

new KmsStack(app, 'monCdkKey', {
  envName: 'dev',
  keyId: 'monCdk',
  keyDesc: 'cdk key',
  keyAlias: 'alias/monCdk',
});

const rdsKey = new KmsStack(app, 'rdsKey', {
  envName: 'dev',
  keyId: 'rdsCdk',
  keyDesc: 'rds key',
  keyAlias: 'alias/rdsCdk',
}).kmsKey;

new BastionHostStack(app, 'BastionHostStack', vpc, bastionSg, {
  keyName: 'monCdkKey',
});

new LambdaS3Stack(app, 'S3Stack', {
  envName: 'dev',
  bucketId: 'lambda-bucket',
  accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
  encryption: s3.BucketEncryption.S3_MANAGED,
  // bucket name should not contain capital letters
  bucketName: 'lambda-bucket',
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

new RdsStack(app, 'RdsStack', vpc, [lambdaSg, bastionSg], rdsKey, {
  envName: 'dev',
});

new RedisStack(
  app,
  'RedisStack',
  vpc,
  [cdk.Fn.importValue('redisSgAllowLambda')],
  {
    envName: 'dev',
  }
);

new CognitoStack(app, 'CognitoStack', {
  envName: 'dev',
});

new ApiGatewayStack(app, 'ApiGatewayStack', {
  envName: 'dev',
});

new LambdaStack(app, 'LambdaStack', {
  envName: 'dev',
});

const { queue, sendingRoles } = new SqsStack(app, 'SqsStack');

new SqsApiGateway(app, 'SqsApiGateway', queue, sendingRoles);

new SqsSnsStack(app, 'SqsSnsStack');

/**
 *
 */
new ArtifactS3Stack(app, 'ArtifactS3Stack', {
  envName: 'dev',
});

new CodePipelineBackend(
  app,
  'CodePipelineBackendStack',
  cdk.Fn.importValue('dev-artifact-bucket'),
  {
    envName: 'dev',
  }
);

new StepFunctionStack(app, 'StepFunctionStack');

new LambdaDockerStack(app, 'LambdaDockerStack');
