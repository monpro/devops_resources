resource "aws_iam_group" "s3-users" {
    name = "s3-users"
}

resource "aws_iam_policy_attachment" "s3-users-attach" {
    name        = "s3-users-attach"
    groups      = [aws_iam_group.s3-users.name]
    policy_arn  = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

# create two users
resource "aws_iam_user" "user1" {
    name = "user1"
}

resource "aws_iam_user" "user2" {
    name = "user2"
}

resource "aws_iam_group_membership" "s3-users" {
    name = "s3-users"
    users = [
        aws_iam_user.user1.name,
        aws_iam_user.user2.name
    ]
    group = aws_iam_group.s3-users.name
}

