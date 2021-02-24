resource "aws_s3_bucket" "monpro-bucket" {
  bucket = "monpro-bucket-1234"
  acl    = "private"

  tags = {
    Name = "monpro-bucket-1234"
  }
}

