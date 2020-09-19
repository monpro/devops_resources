resource "aws_security_group" "allow-ssh" {
    vpc_id = aws_vpc.main.id
    name = "allow-ssh"
    description = "security group allowing ssh"
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress {
        from_port       = 80
        to_port         = 80
        protocol        = "tcp"
        // only traffic from elb
        security_groups = [aws_security_group.elb-security-group.id]
    }
    tags = {
        Name = "allow-ssh"
    }

}

resource "aws_security_group" "elb-security-group" {
    vpc_id = aws_vpc.main.id
    name = "elb-security-group"
    description = "security group for elb"
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress {
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    tags = {
        Name = "elb-security-group"
    }

}