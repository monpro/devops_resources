variable "AWS_ACCESS_KEY" {}

variable "AWS_SECRET_KEY" {}

variable "AWS_REGION" {
    default = "eu-west-1"
}

variable "AMIS" {
    type = map(string)
    default = {
        us-east-1 = "ami-13be557e"
        us-west-2 = "ami-06b94666"
        ap-southeast-2 = "ami-076241d5e2feca04f"
    }
}