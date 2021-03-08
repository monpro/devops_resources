import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as rds from '@aws-cdk/aws-rds';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as ssm from '@aws-cdk/aws-ssm';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as kms from '@aws-cdk/aws-kms';

interface RdsStackProps extends cdk.StackProps {
  envName: string;
  secretName?: string;
  generateStringKey?: string;
}

export class RdsStack extends cdk.Stack {
  private readonly rdsSecret: sm.Secret;

  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, lambdaSg: ec2.SecurityGroup, bastionSg: ec2.SecurityGroup, kmsKey: kms.Key, props: RdsStackProps) {
    super(scope, id, props);

    const {
      envName,
      secretName = `${envName}/rdsSecret`,
      generateStringKey = 'password'
    } = props;

    this.rdsSecret = new sm.Secret(this, 'rdsSecret', {
      secretName,
      generateSecretString: {
        includeSpace: false,
        passwordLength: 15,
        generateStringKey,
        excludePunctuation: true,
        secretStringTemplate: JSON.stringify({'user': 'password'})
      }
    })

  }
}
