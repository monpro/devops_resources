#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcStack } from '../lib/VpcStack';
import {SecurityStack} from "../lib/SecurityStack";
import {BastionHostStack} from "../lib/BastionHostStack";
import {KmsStack} from "../lib/KmsStack";

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
