#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcStack } from '../lib/VpcStack';
import {SecurityStack} from "../lib/SecurityStack";
import {BastionHostStack} from "../lib/BastionHostStack";
import {KmsStack} from "../lib/KmsStack";
import {S3Stack} from "../lib/S3Stack";
import * as s3 from "@aws-cdk/aws-s3";

const app = new cdk.App();
const {vpc} = new VpcStack(app, 'VpcStack', {
  envName: 'dev'
});

const {bastionSg} = new SecurityStack(app, 'SecurityStack', vpc, {
  envName: 'dev'
});

new KmsStack(app, 'monCdkKey', {
  envName: 'dev',
  keyId: 'monCdk',
  keyDesc: 'cdk key',
  keyAlias: 'alias/monCdk'
});

new KmsStack(app, 'rdsKey', {
  envName: 'dev',
  keyId: 'rdsCdk',
  keyDesc: 'rds key',
  keyAlias: 'alias/rdsCdk'
});


new BastionHostStack(app, 'BastionHostStack', vpc, bastionSg, {
  keyName: 'monCdkKey'
});

new S3Stack(app, 'S3Stack', {
  envName: 'dev',
  bucketId: 'lambda-bucket',
  accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
  encryption: s3.BucketEncryption.S3_MANAGED,
  // bucket name should not contain capital letters
  bucketName: 'lambda-bucket',
  removalPolicy: cdk.RemovalPolicy.DESTROY
});
