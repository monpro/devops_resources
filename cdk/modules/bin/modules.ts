#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcStack } from '../lib/VpcStack';
import {SecurityStack} from "../lib/SecurityStack";

const app = new cdk.App();
const {vpc} = new VpcStack(app, 'VpcStack', {
  envName: 'dev'
});

new SecurityStack(app, 'SecurityStack', vpc, {
  envName: 'dev'
});
