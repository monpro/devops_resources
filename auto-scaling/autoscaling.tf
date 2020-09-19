resource "aws_launch_configuration" "ec2-launch-config" {
    name_prefix     = "ec2-launch-config"
    image_id        = var.AMIS[var.AWS_REGION]
    instance_type   = "t2.micro"
    key_name        = aws_key_pair.vpc-test-key.key_name
    security_groups = [aws_security_group.allow-ssh.id]
}

resource "aws_autoscaling_group" "ec2-launch-group" {
    name                      = "ec2-launch-group"
    vpc_zone_identifier       = [aws_subnet.main-public-1.id, aws_subnet.main-public-2.id]
    launch_configuration      = aws_launch_configuration.ec2-launch-config.name
    min_size                  = 1
    max_size                  = 2
    health_check_grace_period = 300
    health_check_type         = "EC2"
    force_delete              = true
    
    tag {
        key = "Name"
        value = "ec2 instance"
        propagate_at_launch = true
    }
}