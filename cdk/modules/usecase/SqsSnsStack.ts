import * as cdk from '@aws-cdk/core';
import * as kms from '@aws-cdk/aws-kms';
import * as sns from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import * as iam from '@aws-cdk/aws-iam';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as snsSubscription from '@aws-cdk/aws-sns-subscriptions';

interface SqsSnsStackProps extends cdk.StackProps {}

/**
 * This stack uses kms to encrypt the msg stored in sns and sqs
 *  The lambda function will publish message to sns.
 *  sqs will subscribe to the sns which means sns would send the message to sqs
 *  It's a traditional architecture
 */
export class KmsStack extends cdk.Stack {
  public readonly kmsKey: kms.Key;

  constructor(scope: cdk.Construct, id: string, props: SqsSnsStackProps) {
    super(scope, id, props);
  }
}
