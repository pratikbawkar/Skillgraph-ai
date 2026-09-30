variable "project_name" { default = "skill-orbit" }
variable "aws_region" { default = "ap-south-1" }
variable "lambda_package_path" { default = "../../../build/backend.zip" }
variable "budget_alert_emails" {
  description = "Email addresses that receive AWS budget alerts. Confirm both SNS subscriptions after the first apply."
  type        = list(string)
  default     = ["pratikbawkar33@gmail.com", "sachin9890@gmail.com"]
}
variable "monthly_budget_limit_usd" { default = 30 }
variable "bedrock_model_arns" { default = [] }
variable "additional_cors_origins" { default = [] }
