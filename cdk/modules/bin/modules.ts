#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcStack } from '../lib/VpcStack';

const app = new cdk.App();
new VpcStack(app, 'VpcStack', {
  envName: 'dev'
});