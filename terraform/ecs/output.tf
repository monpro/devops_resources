output "develop-repo-url" {
    value = aws_ecr_repository.develop.repository_url
}

output "elb" {
  value = aws_elb.app-elb.dns_name
}

output "jenkins" {
  value = aws_instance.jenkins-instance.public_ip
}

