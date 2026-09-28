# Skill Orbit AWS infrastructure

Terraform provisions the Phase 2 serverless foundation described in `plan.md`:

- private S3 static-site bucket behind CloudFront Origin Access Control;
- API Gateway HTTP API and an ARM64 Python 3.11 Lambda running `handler.handler`;
- on-demand DynamoDB tables for users and role progress;
- Cognito user pool and public web client;
- CloudWatch log group, API and Lambda error alarms, and an SNS alert topic;
- an optional monthly AWS Budget notification at $10, $20, and $25.

The module deliberately excludes EC2, VPC/NAT, RDS, EKS, and an ALB. DynamoDB is on-demand and CloudFront uses the lowest regional price class.

## Before an apply

1. Configure AWS credentials locally through an IAM role or profile with permission to manage these resources. Do not put credentials in `terraform.tfvars` or this repository.
2. Copy the environment example to an ignored `terraform.tfvars` file and set a real budget-alert email. Confirm the SNS subscription email after the first apply.
3. Build the Lambda archive from a Linux environment with `bash infrastructure/scripts/package-lambda.sh`. This produces the ignored `build/backend.zip` expected by Terraform.
4. Run Terraform from the chosen environment directory:

```bash
cd infrastructure/terraform/environments/staging
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

Terraform state is local by default. Before shared or production use, configure an S3 backend with locking in each environment root; bootstrap that state bucket separately and keep its state outside this repository.

## Publish the frontend

After the infrastructure apply, inject the API Gateway URL at build time and publish the static export:

```bash
export NEXT_PUBLIC_USE_MOCKS=false
export NEXT_PUBLIC_API_BASE_URL="$(terraform output -raw api_url)"
cd ../../../../frontend
npm ci
npm run build

aws s3 sync out/ "s3://$(cd ../infrastructure/terraform/environments/staging && terraform output -raw frontend_bucket_name)" --delete
aws cloudfront create-invalidation --distribution-id "$(cd ../infrastructure/terraform/environments/staging && terraform output -raw cloudfront_distribution_id)" --paths "/*"
```

The current application remains in Phase 1 behavior: it uses mock auth and in-memory repositories, and its Bedrock integration is not yet implemented. Terraform provisions Cognito and DynamoDB so the application can be migrated without redesigning the deployment. `USE_BEDROCK_MOCK` stays `true` until that migration is complete.

## Outputs

`frontend_url`, `api_url`, `frontend_bucket_name`, `cloudfront_distribution_id`, and `lambda_function_name` are available from each environment root for deployment and smoke-test steps.
