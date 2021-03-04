import * as cdk from '@aws-cdk/core';
import {Bucket, BucketEncryption, IBucket} from "@aws-cdk/aws-s3";
import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";
import * as path from "path";

interface S3BucketWithDeployProps {
  deployFrom: string[]
  encryption: BucketEncryption
}

export class S3BucketWithDeploy extends cdk.Construct{
  public readonly bucket: IBucket;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: S3BucketWithDeployProps
  ) {
    super(scope, id);
    this.bucket = new Bucket(this, 'SampleBucket', {
      encryption: props.encryption
    });

    new BucketDeployment(this, 'SampleAppPhotos', {
      sources: [
        Source.asset(path.join(__dirname, ...props.deployFrom))
      ],
      destinationBucket: this.bucket
    });

  }
}
