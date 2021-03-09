import * as cdk from '@aws-cdk/core';
import * as kms from '@aws-cdk/aws-kms';
import * as ssm from '@aws-cdk/aws-ssm';

interface KmsStackProps extends cdk.StackProps {
  envName: string;
  keyDesc: string;
  keyId: string;
  keyAlias: string;
}

export class KmsStack extends cdk.Stack {
  public readonly kmsKey: kms.Key;

  constructor(scope: cdk.Construct, id: string, props: KmsStackProps) {
    super(scope, id, props);

    const { envName, keyId, keyDesc, keyAlias } = props;

    this.kmsKey = new kms.Key(this, keyId, {
      description: keyDesc,
      enableKeyRotation: true,
    });

    this.kmsKey.addAlias(keyAlias);

    new ssm.StringParameter(this, `${keyId}/${keyDesc}`, {
      parameterName: `/${envName}/${keyId}`,
      stringValue: this.kmsKey.keyId,
    });
  }
}
