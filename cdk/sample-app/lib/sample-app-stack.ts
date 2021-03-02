import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import {Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import {Runtime} from "@aws-cdk/aws-lambda";
import * as path from "path";

export class SampleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'SampleBucket', {
      encryption: BucketEncryption.S3_MANAGED
    });

    const getPhotos = new lambda.NodejsFunction(this, 'SampleLambda', {
      runtime: Runtime.NODEJS_12_X,
      entry: path.join(__dirname, '..', 'api', 'get-photos', 'index.ts'),
      handler: 'getPhotos'
    });

    new cdk.CfnOutput(this, 'SampleBucketNameExport', {
      value: bucket.bucketName,
      exportName: "SampleBucketName"
    })

  }
}
