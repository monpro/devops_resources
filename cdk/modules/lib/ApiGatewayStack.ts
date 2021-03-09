import * as cdk from '@aws-cdk/core';
import * as gateway from '@aws-cdk/aws-apigateway';
import * as ssm from '@aws-cdk/aws-ssm';

interface ApiGatewayStackProps extends cdk.StackProps {
  envName: string;
}

export class ApiGatewayStack extends cdk.Stack {
  private readonly apiGateway: gateway.RestApi;

  constructor(scope: cdk.Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const { envName } = props;

    const region = cdk.Aws.REGION;

    this.apiGateway = new gateway.RestApi(this, 'monApiGateway', {
      endpointTypes: [gateway.EndpointType.REGIONAL],
      restApiName: `mon-${envName}-service`,
    });

    this.apiGateway.root.addMethod('ANY');

    new ssm.StringParameter(this, 'apiGatewayUrl', {
      parameterName: `/${envName}/api-gateway-url`,
      stringValue: `https://${this.apiGateway.restApiId}.execute-api.${region}.amazonaws.com/`,
    });

    new ssm.StringParameter(this, 'apiGatewayId', {
      parameterName: `/${envName}/api-gateway-id`,
      stringValue: this.apiGateway.restApiId,
    });
  }
}
