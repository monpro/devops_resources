import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import {Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import {Runtime} from "@aws-cdk/aws-lambda";
import * as path from "path";
import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";
import {PolicyStatement} from "@aws-cdk/aws-iam";
import {HttpApi, HttpMethod} from "@aws-cdk/aws-apigatewayv2";
import {LambdaProxyIntegration} from "@aws-cdk/aws-apigatewayv2-integrations";
import {Distribution} from "@aws-cdk/aws-cloudfront";
import {ARecord, IPublicHostedZone, RecordTarget} from "@aws-cdk/aws-route53";
import {ICertificate} from "@aws-cdk/aws-certificatemanager";
import {S3Origin} from "@aws-cdk/aws-cloudfront-origins";
import {CloudFrontTarget} from "@aws-cdk/aws-route53-targets";
import {S3BucketWithDeploy} from "./s3-bucket-with-deploy";

interface SampleAppStackProps extends cdk.StackProps{
  dnsName: string;
  hostedZone: IPublicHostedZone;
  certificate: ICertificate;
}

export class SampleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: SampleAppStackProps) {
    super(scope, id, props);

    const { bucket } = new S3BucketWithDeploy(this, 'SampleBucketConstructor', {
      deployFrom: ['..', 'photos'],
      encryption: BucketEncryption.S3_MANAGED
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

    const cloudFront = new Distribution(this, 'SampleAppDistribution', {
      defaultBehavior: {origin: new S3Origin(websiteBucket)},
      domainNames: [props.dnsName],
      certificate: props.certificate
    });

    new ARecord(this, 'SampleAppARecordApex', {
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFront))
    });

    new BucketDeployment(this, 'SampleWebsiteDeploy', {
      sources: [Source.asset(path.join(__dirname, '..', 'frontend', 'build'))],
      destinationBucket: websiteBucket,
      distribution: cloudFront
    });


    new cdk.CfnOutput(this, 'SampleBucketNameExport', {
      value: bucket.bucketName,
      exportName: `SampleBucketName`
    });

    new cdk.CfnOutput(this, 'SampleApiGatewayUrlExport', {
      value: httpApiGateway.url!,
      exportName: `SampleApiGatewayUrl`
    });

    new cdk.CfnOutput(this, 'SampleWebsiteBucketNameExport', {
      value: websiteBucket.bucketName,
      exportName: `SampleWebsiteBucketName`
    });

    new cdk.CfnOutput(this, 'SampleWebsiteUrl', {
      value: cloudFront.distributionDomainName,
      exportName: `SampleWebsiteUrl`
    })
  }
}
