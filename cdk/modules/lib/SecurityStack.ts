import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as ssm from '@aws-cdk/aws-ssm';

interface SecurityStackProps extends cdk.StackProps {
  envName: string;
}

export class SecurityStack extends cdk.Stack {
  public readonly lambdaSg: ec2.SecurityGroup;
  public readonly bastionSg: ec2.SecurityGroup;
  public readonly lambdaRole: iam.Role;

  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, props: SecurityStackProps) {
    super(scope, id, props);

    const {envName} = props;

    this.lambdaSg = new ec2.SecurityGroup(this, 'lambdaSg', {
      securityGroupName: 'lambda-sg',
      vpc,
      description: 'security group for lambda',
      allowAllOutbound: true
    });

    this.bastionSg = new ec2.SecurityGroup(this, 'bastionSg', {
      securityGroupName: 'bastion-sg',
      vpc,
      description: 'security group for bastion host',
      allowAllOutbound: true
    });

    this.bastionSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'ingress rule for ssh');

    this.lambdaRole = new iam.Role(this, 'lambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'lambdaRole',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole'
        )
      ]
    });

    this.lambdaRole.addToPolicy(
      new iam.PolicyStatement(
        {
          actions: ['s3:*', 'rds:*'],
          resources: ['*']
        })
    );

    new ssm.StringParameter(this, 'lambdaSqParamater', {
      parameterName: `/${envName}/lambdaSq`,
      stringValue: this.lambdaSg.securityGroupId
    });

    new ssm.StringParameter(this, 'lambdaRoleArn', {
      parameterName: `/${envName}/lambdaRoleArn`,
      stringValue: this.lambdaRole.roleArn
    });

    new ssm.StringParameter(this, 'lambdaRoleName', {
      parameterName: `/${envName}/lambdaRoleName`,
      stringValue: this.lambdaRole.roleName
    });
  }
}
