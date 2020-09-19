# scale up alarm

resource "aws_autoscaling_policy" "ec2-cpu-policy" {
  name                   = "ec2-cpu-policy"
  autoscaling_group_name = aws_autoscaling_group.ec2-launch-group.name
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = "1"
  cooldown               = "300"
  policy_type            = "SimpleScaling"
}

resource "aws_cloudwatch_metric_alarm" "ec2-cpu-policy" {
  alarm_name          = "ec2-cpu-policy"
  alarm_description   = "ec2-cpu-policy"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "30"

  dimensions = {
    "AutoScalingGroupName" = aws_autoscaling_group.ec2-launch-group.name
  }

  actions_enabled = true
  alarm_actions   = [aws_autoscaling_policy.ec2-cpu-policy.arn]
}

# scale down alarm
resource "aws_autoscaling_policy" "ec2-cpu-policy-scaledown" {
  name                   = "ec2-cpu-policy-scaledown"
  autoscaling_group_name = aws_autoscaling_group.ec2-launch-group.name
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = "-1"
  cooldown               = "300"
  policy_type            = "SimpleScaling"
}

resource "aws_cloudwatch_metric_alarm" "ec2-cpu-policy-scaledown" {
  alarm_name          = "ec2-cpu-policy-scaledown"
  alarm_description   = "ec2-cpu-policy-scaledown"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "5"

  dimensions = {
    "AutoScalingGroupName" = aws_autoscaling_group.ec2-launch-group.name
  }

  actions_enabled = true
  // when cloudwatch alarm, it will trigger the policy scaledown
  alarm_actions   = [aws_autoscaling_policy.ec2-cpu-policy-scaledown.arn]
}

