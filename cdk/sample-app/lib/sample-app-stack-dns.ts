import * as cdk from "@aws-cdk/core";
import {IPublicHostedZone, PublicHostedZone} from "@aws-cdk/aws-route53";
import {Certificate, CertificateValidation, ICertificate} from '@aws-cdk/aws-certificatemanager';
interface SampleAppStackDnskProps extends cdk.StackProps{
  dnsName: string;
}

export class SampleAppStackDns extends cdk.Stack{

  public readonly hostedZone: IPublicHostedZone;
  public readonly  certificate: ICertificate;
  constructor(scope: cdk.Construct, id: string, props: SampleAppStackDnskProps) {
    super(scope, id, props);
    this.hostedZone = new PublicHostedZone(this, 'SampleAppStackDns', {
      zoneName: props.dnsName
    });
    this.certificate = new Certificate(this, 'SampleAppStackCertificate', {
      domainName: props.dnsName,
      validation: CertificateValidation.fromDns(this.hostedZone)
    })
  }
}


