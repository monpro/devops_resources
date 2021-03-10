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
export class SqsSnsStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: SqsSnsStackProps) {
    super(scope, id, props);

    const encryptionKey = new kms.Key(this, 'encryptionKey');

    encryptionKey.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: "sns-access",
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("sns")],
        actions: ["kms:Decrypt", "kms:GenerateDataKey"],
      })
    );

    const queue = new sqs.Queue(this, 'sqsQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      encryption: sqs.QueueEncryption.KMS,
      dataKeyReuse: cdk.Duration.minutes(10),
      encryptionMasterKey: encryptionKey.addAlias('encryption/sqs')
    });

    const topic = new sns.Topic(this, 'snsTopic', {
      masterKey: encryptionKey.addAlias('encryption/sns')
    });

    topic.addSubscription(
      new snsSubscription.SqsSubscription(queue, {
        rawMessageDelivery: true,
      })
    );

    const testFunction = new lambdaNode.NodejsFunction(this, 'testFunction', {
      entry: 'resource/nodeTest.ts',
      handler: 'start',
      environment: {
        TOPIC_ARN: topic.topicArn,
      }
    });

    encryptionKey.grant(testFunction, "kms:Decrypt", "kms:GenerateDataKey");

    topic.grantPublish(testFunction);


  }
}
