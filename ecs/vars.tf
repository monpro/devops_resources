variable "AWS_REGION" {
  default = "ap-southeast-2"
}

variable "PATH_TO_PRIVATE_KEY" {
  default = "mykey"
}

variable "PATH_TO_PUBLIC_KEY" {
  default = "mykey.pub"
}

variable "ECS_INSTANCE_TYPE" {
  default = "t2.micro"
}


variable "ECS_AMIS" {
    type = map(string)
    default = {
        us-east-1 = "ami-13be557e"
        us-west-2 = "ami-06b94666"
        ap-southeast-2 = "ami-0310b7b3566b52ecc"
    }
}

variable "AMIS" {
    type = map(string)
    default = {
        us-east-1 = "ami-13be557e"
        us-west-2 = "ami-06b94666"
        ap-southeast-2 = "ami-076241d5e2feca04f"
    }
}

variable "INSTANCE_DEVICE_NAME" {
  default = "/dev/xvdh"
}

variable "JENKINS_VERSION" {
  default = "2.204.1"
}

variable "APP_SERVICE_ENABLED" {
  default = "0"
}

variable "APP_VERSION" {
  default = "0"
}

