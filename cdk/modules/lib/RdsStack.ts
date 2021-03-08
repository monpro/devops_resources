import * as cdk from '@aws-cdk/core';
import * as rds from '@aws-cdk/aws-rds';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as ssm from '@aws-cdk/aws-ssm';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as kms from '@aws-cdk/aws-kms';

interface RdsStackProps extends cdk.StackProps {
  envName: string;
  secretName?: string;
  generateStringKey?: string;
  rdsRemovalPolicy?: cdk.RemovalPolicy;
}

export class RdsStack extends cdk.Stack {
  private readonly rdsSecret: sm.Secret;
  private readonly rdsCluster: rds.DatabaseCluster;

  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, securityGroups: ec2.SecurityGroup[], kmsKey: kms.Key, props: RdsStackProps) {
    super(scope, id, props);

    const {
      envName,
      secretName = `${envName}/rdsSecret`,
      generateStringKey = 'password',
      rdsRemovalPolicy = cdk.RemovalPolicy.DESTROY
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
    });

    this.rdsCluster = new rds.DatabaseCluster(this, 'rdsCluster', {
      defaultDatabaseName: `${envName}Cluster`,
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_5_7_12
      }),
      instanceProps: {
        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.ISOLATED
        },
        instanceType: new ec2.InstanceType('t3.small')
      },
      instances: 1,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'rdsParameterGroup', 'default.aurora-mysql5.7'),
      storageEncryptionKey: kmsKey,
      removalPolicy: rdsRemovalPolicy
    });

    securityGroups.forEach(securityGroup => {
      this.rdsCluster.connections.allowDefaultPortFrom(securityGroup, `allow access from ${securityGroup.securityGroupName}`)
    });

    // just host db in dev env
    // not in distribution prod, use trivial name for simplicity
    new ssm.StringParameter(this, 'databaseHost', {
      parameterName: `/${envName}/databaseHost`,
      stringValue: this.rdsCluster.clusterEndpoint.hostname
    });

    new ssm.StringParameter(this, 'databaseName', {
      parameterName: `/${envName}/databaseName`,
      stringValue: `${envName}Cluster`
    })

  }
}
