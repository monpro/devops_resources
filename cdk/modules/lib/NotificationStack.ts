import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as sns from '@aws-cdk/aws-sns';
import * as subscription from '@aws-cdk/aws-sns-subscriptions';

interface NotificationStackProps extends cdk.StackProps {
  envName: string;
}

export class NotificationStack extends cdk.Stack {
  public readonly lambdaFunction: lambda.Function;
  constructor(scope: cdk.Construct, id: string, props: NotificationStackProps) {
    super(scope, id, props);

    const { envName } = props;

    this.lambdaFunction = new lambda.Function(this, 'notificationFunction', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset('resource'),
      handler: 'test.handler',
    });

    const cloudWatchRule = new events.Rule(this, '5amRule', {
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '0',
        month: '*',
        weekDay: '*',
        year: '*',
      }),
    });

    const lambdaTopic = new sns.Topic(this, 'notificationTopic', {
      topicName: 'notification-lambda-topic',
    });

    cloudWatchRule.addTarget(new targets.LambdaFunction(this.lambdaFunction));

    lambdaTopic.addSubscription(
      new subscription.LambdaSubscription(this.lambdaFunction)
    );
  }
}
