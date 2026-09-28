output "frontend_bucket_name" { value = aws_s3_bucket.frontend.bucket }
output "cloudfront_distribution_id" { value = aws_cloudfront_distribution.frontend.id }
output "frontend_url" { value = "https://${aws_cloudfront_distribution.frontend.domain_name}" }
output "api_url" { value = aws_apigatewayv2_stage.default.invoke_url }
output "lambda_function_name" { value = aws_lambda_function.api.function_name }
output "cognito_user_pool_id" { value = aws_cognito_user_pool.users.id }
output "cognito_web_client_id" { value = aws_cognito_user_pool_client.web.id }
output "alerts_topic_arn" { value = aws_sns_topic.alerts.arn }
