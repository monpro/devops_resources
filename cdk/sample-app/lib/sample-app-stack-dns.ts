import * as cdk from "@aws-cdk/core";

interface SampleAppStackDnskProps extends cdk.StackProps{
  dnsName: string;
}

export class SampleAppStackDns extends cdk.Stack{
  constructor(scope: cdk.Construct, id: string, props: SampleAppStackDnskProps) {
    super(scope, id, props);
  }

}


