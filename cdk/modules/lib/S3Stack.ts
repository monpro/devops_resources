import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ssm from '@aws-cdk/aws-ssm';

interface S3StackProps extends cdk.StackProps {
  envName: string;
  bucketId: string;
  accessControl: s3.BucketAccessControl;
  encryption: s3.BucketEncryption;
  bucketName: string;
  removalPolicy: cdk.RemovalPolicy;
}

export class S3Stack extends cdk.Stack {
  private readonly lambdaBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: S3StackProps ) {
    super(scope, id, props);

    const {
      envName,
      bucketId,
      accessControl,
      encryption,
      bucketName,
      removalPolicy
    } = props;

    const accountId = cdk.Aws.ACCOUNT_ID;
    this.lambdaBucket = new s3.Bucket(this, bucketId, {
      accessControl,
      encryption,
      bucketName: `${accountId}-${bucketName}`,
      removalPolicy,
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      }
    });
    new ssm.StringParameter(this, `ssm-${bucketName}`, {
      parameterName: `/${envName}/${bucketName}`,
      stringValue: this.lambdaBucket.bucketName
    })
  }
}
