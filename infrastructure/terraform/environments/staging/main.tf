provider "aws" {
  region = var.aws_region
  default_tags { tags = { Project = var.project_name, Environment = "staging", ManagedBy = "Terraform" } }
}

module "application" {
  source = "../../modules/application"

  project_name             = var.project_name
  environment              = "staging"
  aws_region               = var.aws_region
  lambda_package_path      = var.lambda_package_path
  log_retention_days       = 7
  budget_alert_emails      = var.budget_alert_emails
  monthly_budget_limit_usd = var.monthly_budget_limit_usd
  bedrock_model_arns       = var.bedrock_model_arns
  additional_cors_origins  = var.additional_cors_origins
}
