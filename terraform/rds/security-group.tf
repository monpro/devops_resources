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
    tags = {
        Name = "allow-ssh"
    }
}

resource "aws_security_group" "allow-mariadb" {
    vpc_id = aws_vpc.main.id
    name = "allow-mariadb"
    description = "security group allowing mariadb"
    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
        self        = true
    }
    ingress {
        from_port   = 3306
        to_port     = 3306
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        security_groups = [aws_security_group.allow-ssh.id] # allowing access from our example instance
    }
    tags = {
        Name = "allow-mariadb"
    }
}