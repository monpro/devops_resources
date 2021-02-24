output "ELB" {
  value = aws_elb.ec2-elb.dns_name
}
