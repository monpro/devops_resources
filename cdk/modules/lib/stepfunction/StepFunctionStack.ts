import * as cdk from '@aws-cdk/core';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as lambda from '@aws-cdk/aws-lambda';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';

/**
 * A stack aggregate lambda operations using StepFunction
 *
 * Only for demonstration, not for production
 */
export class StepFunctionStack extends cdk.Stack {
  private stateMachine: sfn.StateMachine;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const generateCurrentTimeLambda = new lambda.Function(
      this,
      'GenerateCurrentTime',
      {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler',
        // or use from Bucket or inline
        code: lambda.Code.fromInline(`
        exports.handler = async () => ({"currentTime": Date.now()})
      `),
      }
    );

    const isExpiredLambda = new lambda.Function(this, 'isExpiredLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      // or use from Bucket or inline
      code: lambda.Code.fromInline(`
        exports.handler = async (value) => ({"currentTime": value > new Date('30 Aug 2020 03:04:05 GMT').valueOf()})
      `),
    });

    const definition = new tasks.LambdaInvoke(this, 'GenerateCurrentTimeStep', {
      lambdaFunction: generateCurrentTimeLambda,
      outputPath: '$.payload',
    })
      .next(
        new sfn.Wait(this, 'wait for 10 seconds', {
          time: sfn.WaitTime.duration(cdk.Duration.seconds(1)),
        })
      )
      .next(
        new tasks.LambdaInvoke(this, 'isExpiredLambdaStep', {
          lambdaFunction: isExpiredLambda,
          outputPath: '$.payload',
        })
      );

    this.stateMachine = new sfn.StateMachine(this, 'StateMachine-Demo-Lambda', {
      definition,
      timeout: cdk.Duration.minutes(5),
    });
  }
}
