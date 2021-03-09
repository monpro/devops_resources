import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

interface BastionHostStackProps extends cdk.StackProps {
    keyName: string;
}
export class BastionHostStack extends cdk.Stack {
    private readonly bastionHost: ec2.Instance;

    constructor(
        scope: cdk.Construct,
        id: string,
        vpc: ec2.Vpc,
        sg: ec2.SecurityGroup,
        props: BastionHostStackProps
    ) {
        super(scope, id, props);

        const { keyName } = props;
        this.bastionHost = new ec2.Instance(this, 'bastionHost', {
            vpc,
            keyName,
            securityGroup: sg,
            instanceType: new ec2.InstanceType('t2.micro'),
            machineImage: new ec2.AmazonLinuxImage({
                edition: ec2.AmazonLinuxEdition.STANDARD,
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
                virtualization: ec2.AmazonLinuxVirt.HVM,
                storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
            }),
            // make bastion host works on public subnet
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
        });
    }
}
