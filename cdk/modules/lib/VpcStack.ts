import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ssm from '@aws-cdk/aws-ssm';
import { SubnetType } from '@aws-cdk/aws-ec2';

interface VpcStackProps extends cdk.StackProps {
    envName: string;
}

export class VpcStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;

    constructor(scope: cdk.Construct, id: string, props: VpcStackProps) {
        super(scope, id, props);
        const { envName } = props;
        this.vpc = new ec2.Vpc(this, 'devVpc', {
            cidr: '156.32.0.0/16',
            maxAzs: 2,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            subnetConfiguration: [
                {
                    name: 'Public',
                    subnetType: SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: 'Private',
                    subnetType: SubnetType.PRIVATE,
                    cidrMask: 24,
                },
                {
                    name: 'Isolated',
                    subnetType: SubnetType.ISOLATED,
                    cidrMask: 24,
                },
            ],
            natGateways: 1,
        });

        const privateSubnetsIds = this.vpc.privateSubnets.map(
            (subnet) => subnet.subnetId
        );

        privateSubnetsIds.forEach((subnetId, index) => {
            new ssm.StringParameter(this, `private-subnet-${index}`, {
                parameterName: `/${envName}/private-subnet-${index}`,
                stringValue: subnetId,
            });
        });
    }
}
