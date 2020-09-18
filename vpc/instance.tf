resource "aws_instance" "vpc-example" {
    ami = var.AMIS[var.AWS_REGION]
    instance_type = "t2.micro"

    # set the vpc subnet
    subnet_id = aws_subnet.main-public-1.id

    # set the security group inside vpc
    vpc_security_group_ids = [aws_security_group.allow-ssh.id]

    # set the public ssh key, then you could use the private key to ssh
    key_name = aws_key_pair.vpc-test-key.key_name

    # install user data
    user_data = data.template_cloudinit_config.cloudinit-example.rendered
}

resource "aws_ebs_volume" "ebs-volume-1" {
    availability_zone = "${var.AWS_REGION}a"
    size = 20
    type = "gp2"
    tags = {
        Name = "extra volume data"
    }
}

resource "aws_volume_attachment" "ebs-volume-1-attachment" {
    device_name = "/dev/xvdh"
    volume_id = aws_ebs_volume.ebs-volume-1.id
    instance_id = aws_instance.vpc-example.id
    skip_destroy = true                            # skip destroy to avoid issues with terraform destroy
}