resource "aws_key_pair" "vpc-test-key" {
  key_name   = "vpc-test-key"
  public_key = file(var.PATH_TO_PUBLIC_KEY)
}

