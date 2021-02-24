terraform {
    # store the terraform state in remote s3 bucket as an object
    backend "s3" {
        bucket = "terraform-state-monpro-test"
        key    = "terraform/backend"
        region = "ap-southeast-2"
    }
}