import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

interface RedisStackProps extends cdk.StackProps {
  envName: string;
}

export class RedisStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, securityGroups: string[], props: RedisStackProps) {
    super(scope, id, props);

    const {
      envName
    } = props;
  }
}
