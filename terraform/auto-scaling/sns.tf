resource "aws_sns_topic" "ec2-scaling-sns" {
 name         = "ec2-scaling-sns"
 display_name = "example ASG SNS topic"
}

resource "aws_autoscaling_notification" "ec2-notify" {
 group_names = [aws_autoscaling_group.ec2-launch-group.name]
 topic_arn     = aws_sns_topic.ec2-scaling-sns.arn
 notifications  = [
   "autoscaling:EC2_INSTANCE_LAUNCH",
   "autoscaling:EC2_INSTANCE_TERMINATE",
   "autoscaling:EC2_INSTANCE_LAUNCH_ERROR"
 ]
}
