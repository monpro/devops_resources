resource "aws_instance" "vpc_example" {
    ami = var.AMIS[var.AWS_REGION]
    instance_type = "t2.micro"

    # set the vpc subnet
    subnet_id = aws_subnet.main-public-1.id

    # set the security group inside vpc
    vpc_security_group_ids = [aws_security_group.allow-ssh.id]

    # set the public ssh key, then you could use the private key to ssh
    key_name = aws_key_pair.vpc-test-key.key_name
}