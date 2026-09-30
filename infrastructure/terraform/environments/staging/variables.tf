variable "project_name" { default = "skill-orbit" }
variable "aws_region" { default = "ap-south-1" }
variable "lambda_package_path" { default = "../../../build/backend.zip" }
variable "budget_alert_emails" {
  type    = list(string)
  default = []
}
variable "monthly_budget_limit_usd" { default = 25 }
variable "bedrock_model_arns" { default = [] }
variable "additional_cors_origins" { default = [] }
