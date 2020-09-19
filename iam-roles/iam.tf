resource "aws_iam_role" "s3-bucket-role" {
    name = "s3-bucket-role"
    assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_instance_profile" "s3-bucket-role-profile" {
    name = "s3-bucket-role-profile"
    role = aws_iam_role.s3-bucket-role.name
}

resource "aws_iam_role_policy" "s3-bucket-role-policy" {
    name = "s3-bucket-role-policy"
    role = aws_iam_role.s3-bucket-role.id
      policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "s3:*"
            ],
            "Resource": [
              "arn:aws:s3:::monpro-bucket-1234",
              "arn:aws:s3:::monpro-bucket-1234/*"
            ]
        }
    ]
}
EOF
}