import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';

interface ArtifactS3StackProps extends cdk.StackProps {
  envName: string;
}

export class ArtifactS3Stack extends cdk.Stack {
  public readonly artifactBucket: s3.Bucket;
  public readonly backendArtifactBucket: s3.Bucket;
  public readonly frontendArtifactBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: ArtifactS3StackProps) {
    super(scope, id, props);

    const { envName } = props;

    const accountId = cdk.Aws.ACCOUNT_ID;

    this.artifactBucket = new s3.Bucket(this, `${envName}-artifact`, {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      bucketName: `${accountId}-${envName}-artifact`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
    });

    this.backendArtifactBucket = new s3.Bucket(
      this,
      `backend-${envName}-artifact`,
      {
        accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        bucketName: `${accountId}-${envName}-backend-artifact`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        blockPublicAccess: {
          blockPublicAcls: true,
          blockPublicPolicy: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: true,
        },
      }
    );

    this.frontendArtifactBucket = new s3.Bucket(
      this,
      `frontend-${envName}-artifact`,
      {
        accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        bucketName: `${accountId}-${envName}-frontend-artifact`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        blockPublicAccess: {
          blockPublicAcls: true,
          blockPublicPolicy: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: true,
        },
      }
    );

    new cdk.CfnOutput(this, `s3-build-${envName}-artifacts-export`, {
      exportName: `${envName}-artifact-bucket`,
      value: this.artifactBucket.bucketName,
    });

    new cdk.CfnOutput(this, `s3-build-${envName}-backend-artifacts-export`, {
      exportName: `backend-${envName}-artifact-bucket`,
      value: this.backendArtifactBucket.bucketName,
    });

    new cdk.CfnOutput(this, `s3-build-${envName}-frontend-artifacts-export`, {
      exportName: `frontend-${envName}-artifact-bucket`,
      value: this.frontendArtifactBucket.bucketName,
    });
  }
}
