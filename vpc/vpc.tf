# set up VPC
resource "aws_vpc" "main" {
    cidr_block           = "10.0.0.0/16"
    instance_tenancy     = "default"
    enable_dns_support   = "true"
    enable_dns_hostnames = "true"
    enable_classiclink   = "false"
    tags = {
        Name = "main"
    }
}

# set up three subnets 
resource "aws_subnet" "main-public-1" {
    vpc_id                  = aws_vpc.main.id
    cidr_block              = "10.0.1.0/24"
    map_public_ip_on_launch = "true"
    availability_zone       = "ap-southeast-2a"

    tags = {
        Name = "main-public-1"
    }
}

resource "aws_subnet" "main-public-2" {
    vpc_id                  = aws_vpc.main.id
    cidr_block              = "10.0.2.0/24"
    map_public_ip_on_launch = "true"
    availability_zone       = "ap-southeast-2b"

    tags = {
        Name = "main-public-2"
    }
}

resource "aws_subnet" "main-public-3" {
    vpc_id                  = aws_vpc.main.id
    cidr_block              = "10.0.3.0/24"
    map_public_ip_on_launch = "true"
    availability_zone       = "ap-southeast-2c"

    tags = {
        Name = "main-public-3"
    }
}

resource "aws_subnet" "main-private-1" {
    vpc_id                  = aws_vpc.main.id
    cidr_block              = "10.0.4.0/24"
    map_public_ip_on_launch = "false"
    availability_zone       = "ap-southeast-2a"

    tags = {
        Name = "main-private-1"
    }
}

resource "aws_subnet" "main-private-2" {
    vpc_id                  = aws_vpc.main.id
    cidr_block              = "10.0.5.0/24"
    map_public_ip_on_launch = "false"
    availability_zone       = "ap-southeast-2b"

    tags = {
        Name = "main-private-2"
    }
}

resource "aws_subnet" "main-private-3" {
    vpc_id                  = aws_vpc.main.id
    cidr_block              = "10.0.6.0/24"
    map_public_ip_on_launch = "false"
    availability_zone       = "ap-southeast-2c"

    tags = {
        Name = "main-private-3"
    }
}

# set up Internet Gateway to communicate with outside vpc
resource "aws_internent_gateway" "main-gw" {
    vpc_id = aws_vpc.main.id

    tags = {
        Name = "main"
    }
}

# set up the route tables
resource "aws_route_table" "main-public" {
    vpc_id = aws_vpc.main.id
    route {
        # route all the traffic to gateway except internal ones
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internent_gateway.main-gw.id
    }

    tags = {
        Name = "main-public-route-table"
    }
}

# route associations public with route tables
resource "aws_route_table_association" "main-public-1-a" {
    subnet_id = aws_subnet.main-public-1.id
    route_table_id = aws_route_table.main-public.id
}

resource "aws_route_table_association" "main-public-2-a" {
    subnet_id = aws_subnet.main-public-2.id
    route_table_id = aws_route_table.main-public.id
}

resource "aws_route_table_association" "main-public-3-a" {
    subnet_id = aws_subnet.main-public-3.id
    route_table_id = aws_route_table.main-public.id
}