#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SampleAppStack } from '../lib/sample-app-stack';
import {SampleAppStackDns} from "../lib/sample-app-stack-dns";

const domainName = 'monproshen.com';
const app = new cdk.App();

const { hostedZone, certificate } = new SampleAppStackDns(app, 'SampleAppStackDns', {
  dnsName: domainName,
  env: {
    region: 'us-east-2'
  }
});

new SampleAppStack(app, 'SampleAppStack', {
  dnsName: domainName,
  hostedZone,
  certificate,
  env: {
    region: 'us-east-2'
  }
});
