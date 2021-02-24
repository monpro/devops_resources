output "instance" {
  value = aws_instance.vpc-example.public_ip
}

output "rds" {
  value = aws_db_instance.mariadb.endpoint
}

