import {expect as expectCDK, matchTemplate, MatchStyle} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SampleApp from '../lib/sample-app-stack';
import '@aws-cdk/assert/jest';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SampleApp.SampleAppStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(matchTemplate({
    "Resources": {
      "SampleBucket7F6F8160": {
        "Type": "AWS::S3::Bucket",
        "Properties": {
          "BucketEncryption": {
            "ServerSideEncryptionConfiguration": [
              {
                "ServerSideEncryptionByDefault": {
                  "SSEAlgorithm": "AES256"
                }
              }
            ]
          }
        },
        "UpdateReplacePolicy": "Retain",
        "DeletionPolicy": "Retain"
      },
    },
    "Outputs": {
      "SampleBucketNameExport": {
        "Value": {
          "Ref": "SampleBucket7F6F8160"
        },
        "Export": {
          "Name": "SampleBucketName"
        }
      }
    },
  }, MatchStyle.EXACT));
});

test('Stack create a s3 bucket', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SampleApp.SampleAppStack(app, 'MyTestStack');
  // THEN
  expect(stack).toHaveResource('AWS::S3::Bucket')
})
