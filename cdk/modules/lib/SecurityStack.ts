import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

interface SecurityStackProps extends cdk.StackProps {
  envName: string;
}

export class SecurityStack extends cdk.Stack {
  private readonly lambdaSg: ec2.SecurityGroup;
  private readonly bastionSg: ec2.SecurityGroup;

  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, props: SecurityStackProps) {
    super(scope, id, props);

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
    })
  }
}
