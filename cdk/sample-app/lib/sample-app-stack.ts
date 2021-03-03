import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import {Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import {Runtime} from "@aws-cdk/aws-lambda";
import * as path from "path";
import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {HttpApi, HttpMethod} from "@aws-cdk/aws-apigatewayv2";
import {LambdaProxyIntegration} from "@aws-cdk/aws-apigatewayv2-integrations";
import {CloudFrontWebDistribution} from "@aws-cdk/aws-cloudfront";

export class SampleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'SampleBucket', {
      encryption: BucketEncryption.S3_MANAGED
    });

    new BucketDeployment(this, 'SampleAppPhotos', {
      sources: [
        Source.asset(path.join(__dirname, '..', 'photos'))
      ],
      destinationBucket: bucket
    });

    const getPhotos = new lambda.NodejsFunction(this, 'SampleLambda', {
      runtime: Runtime.NODEJS_12_X,
      entry: path.join(__dirname, '..', 'api', 'get-photos', 'index.ts'),
      handler: 'getPhotos',
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName
      }
    });

    const bucketContainerPermissions = new PolicyStatement();
    bucketContainerPermissions.addResources(bucket.bucketArn);
    bucketContainerPermissions.addActions('s3:ListBucket');

    const bucketObjectPermissions = new PolicyStatement();
    bucketObjectPermissions.addResources(`${bucket.bucketArn}/*`);
    bucketObjectPermissions.addActions('s3:GetObject', 's3:PutObject');

    getPhotos.addToRolePolicy(bucketContainerPermissions);
    getPhotos.addToRolePolicy(bucketObjectPermissions);

    const httpApiGateway = new HttpApi(this, 'SampleApiGateway', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [HttpMethod.GET]
      },
      apiName: 'photo-api',
      createDefaultStage: true
    });

    const lambdaIntegration = new LambdaProxyIntegration({
      handler: getPhotos
    });

    httpApiGateway.addRoutes({
      path: '/photos',
      methods: [
        HttpMethod.GET
      ],
      integration: lambdaIntegration
    });

    const websiteBucket = new Bucket(this, 'SampleWebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    const cloudFront = new CloudFrontWebDistribution(this, 'SampleAppDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket
          },
          behaviors: [{isDefaultBehavior: true}]
        }
      ],
    });

    new BucketDeployment(this, 'SampleWebsiteDeploy', {
      sources: [Source.asset(path.join(__dirname, '..', 'frontend', 'build'))],
      destinationBucket: websiteBucket,
      distribution: cloudFront
    });


    new cdk.CfnOutput(this, 'SampleBucketNameExport', {
      value: bucket.bucketName,
      exportName: "SampleBucketName"
    });

    new cdk.CfnOutput(this, 'SampleApiGatewayUrlExport', {
      value: httpApiGateway.url!,
      exportName: 'SampleApiGatewayUrl'
    });

    new cdk.CfnOutput(this, 'SampleWebsiteBucketNameExport', {
      value: websiteBucket.bucketName,
      exportName: 'SampleWebsiteBucketName'
    });

    new cdk.CfnOutput(this, 'SampleWebsiteUrl', {
      value: cloudFront.distributionDomainName,
      exportName: 'SampleWebsiteUrl'
    })
  }
}
