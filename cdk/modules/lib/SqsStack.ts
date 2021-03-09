import * as cdk from '@aws-cdk/core';
import * as sqs from '@aws-cdk/aws-sqs';
import * as iam from '@aws-cdk/aws-iam';

interface SqsStackProps extends cdk.StackProps {}

export class SqsStack extends cdk.Stack {
    private readonly queue: sqs.Queue;
    public readonly sendingRoles: iam.Role[];

    constructor(
        scope: cdk.Construct,
        id: string,
        roles?: iam.Role[],
        props?: SqsStackProps
    ) {
        super(scope, id, props);

        this.queue = new sqs.Queue(this, 'monQueue', {
            queueName: 'monTestQueue.fifo',
            fifo: true,
        });

        const credentialsRole = new iam.Role(this, 'credentialsRole', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
        });

        this.sendingRoles = [credentialsRole];

        if (roles) {
            this.sendingRoles = [...this.sendingRoles, ...roles];
        }

        this.sendingRoles.forEach((role, index) => {
            role.attachInlinePolicy(
                new iam.Policy(this, `mon-${index}-SendMessagePolicy`, {
                    statements: [
                        new iam.PolicyStatement({
                            actions: ['sqs:SendMessage'],
                            effect: iam.Effect.ALLOW,
                            resources: [this.queue.queueArn],
                        }),
                    ],
                })
            );
        });
    }
}
