resource "aws_key_pair" "ecs-test-key" {
  key_name   = "ecs-test-key"
  public_key = file(var.PATH_TO_PUBLIC_KEY)
}

