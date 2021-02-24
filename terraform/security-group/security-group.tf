data "aws_ip_ranges" "sydney_ec2" {
    regions = ["ap-southeast-2"]
    services = ["ec2"]
}

resource "aws_security_group" "from_sydney" {
    name = "from_sydney"
    ingress {
        from_port = "443"
        to_port = "443"
        protocol = "tcp"
        cidr_blocks = data.aws_ip_ranges.sydney_ec2.cidr_blocks
    }
    tags = {
        CreateDate = data.aws_ip_ranges.sydney_ec2.create_date
        SyncToken  = data.aws_ip_ranges.sydney_ec2.sync_token
    }
}