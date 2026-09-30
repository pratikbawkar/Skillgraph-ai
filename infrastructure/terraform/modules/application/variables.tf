variable "project_name" { type = string }
variable "environment" {
  type = string
  validation {
    condition     = var.environment == "prod"
    error_message = "environment must be prod."
  }
}
variable "aws_region" { type = string }
variable "lambda_package_path" { type = string }
variable "lambda_memory_size" {
  type    = number
  default = 512
}
variable "lambda_timeout_seconds" {
  type    = number
  default = 30
}
variable "log_retention_days" { type = number }
variable "budget_alert_emails" {
  type    = list(string)
  default = []
}
variable "monthly_budget_limit_usd" {
  type    = number
  default = 25
}
variable "bedrock_model_arns" {
  type    = list(string)
  default = []
}
variable "additional_cors_origins" {
  type    = list(string)
  default = []
}
variable "github_repository" {
  type    = string
  default = null
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
