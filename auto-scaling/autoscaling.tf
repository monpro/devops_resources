resource "aws_launch_configuration" "ec2-launch-config" {
    name_prefix     = "ec2-launch-config"
    image_id        = var.AMIS[var.AWS_REGION]
    instance_type   = "t2.micro"
    key_name        = aws_key_pair.vpc-test-key.key_name
    security_groups = [aws_security_group.allow-ssh.id]
    // write current ip to the html to view the load balancing 
    user_data       = "#!/bin/bash\napt-get update\napt-get -y install net-tools nginx\nMYIP=`ifconfig | grep -E '(inet 10)|(addr:10)' | awk '{ print $2 }' | cut -d ':' -f2`\necho 'this is: '$MYIP > /var/www/html/index.html"
    lifecycle {
        create_before_destroy = true
    }
}

resource "aws_autoscaling_group" "ec2-launch-group" {
    name                      = "ec2-launch-group"
    vpc_zone_identifier       = [aws_subnet.main-public-1.id, aws_subnet.main-public-2.id]
    launch_configuration      = aws_launch_configuration.ec2-launch-config.name
    min_size                  = 2
    max_size                  = 2
    health_check_grace_period = 300
    health_check_type         = "ELB"
    load_balancers            = [aws_elb.ec2-elb.name]
    force_delete              = true
    
    tag {
        key = "Name"
        value = "ec2 instance"
        propagate_at_launch = true
    }
}