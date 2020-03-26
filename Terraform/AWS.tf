provider "aws" {
  access_key = var.awsuser
  secret_key = var.awskey
  region     = "us-east-1"
}

#resource "aws_instance" "example" {
##  ami           = "ami-2757f631"
##  instance_type = "t2.micro"
##}