import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as ssm from '@aws-cdk/aws-ssm';

interface CognitoStackProps extends cdk.StackProps {
  envName: string;
}

export class CognitoStack extends cdk.Stack {
  private readonly userPool: cognito.CfnUserPool;
  private readonly userPoolClient: cognito.CfnUserPoolClient;
  private readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: cdk.Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);
    const { envName } = props;

    this.userPool = new cognito.CfnUserPool(this, 'monCognitoUserPool', {
      autoVerifiedAttributes: ['email'],
      usernameAttributes: ['email', 'phone_number'],
      userPoolName: 'monUserPool',
      schema: [
        {
          attributeDataType: 'String',
          name: 'param',
          mutable: true,
        },
      ],
      policies: {
        passwordPolicy: {
          minimumLength: 12,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
          requireUppercase: true,
        },
      },
    });

    this.userPoolClient = new cognito.CfnUserPoolClient(this, 'monPoolClient', {
      userPoolId: this.userPool.ref,
      clientName: `${envName}AppClient`,
    });

    this.identityPool = new cognito.CfnIdentityPool(this, 'monIdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.ref,
          providerName: this.userPool.attrProviderName,
        },
      ],
      identityPoolName: `${envName}IdentityPool`,
    });

    new ssm.StringParameter(this, 'appId', {
      parameterName: `/${envName}/cognitoAppClientId`,
      stringValue: this.userPool.ref,
    });

    new ssm.StringParameter(this, 'userPoolId', {
      parameterName: `/${envName}/userPoolId`,
      stringValue: this.userPoolClient.userPoolId,
    });

    new ssm.StringParameter(this, 'identityPoolId', {
      parameterName: `/${envName}/identityPoolId`,
      stringValue: this.identityPool.ref,
    });
  }
}
