output "frontend_bucket_name" { value = module.application.frontend_bucket_name }
output "cloudfront_distribution_id" { value = module.application.cloudfront_distribution_id }
output "frontend_url" { value = module.application.frontend_url }
output "api_url" { value = module.application.api_url }
output "lambda_function_name" { value = module.application.lambda_function_name }
output "cognito_user_pool_id" { value = module.application.cognito_user_pool_id }
output "cognito_web_client_id" { value = module.application.cognito_web_client_id }
