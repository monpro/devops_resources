#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SampleAppStack } from '../lib/sample-app-stack';

const app = new cdk.App();
new SampleAppStack(app, 'SampleAppStack-dev', {
  env: {
    region: 'us-east-2',
  },
  envName: 'dev'

});
new SampleAppStack(app, 'SampleAppStack-prod', {
  env: {
    region: 'us-west-1',
  },
  envName: 'prod'

});
