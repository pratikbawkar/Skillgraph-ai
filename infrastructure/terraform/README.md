# AWS production deployment

The `prod` Terraform root is the only environment used by automated deployment. CI checks pull requests to `main` and pushes to `develop`. A push to `main` runs the CI workflow, applies the production Terraform configuration, builds the frontend against the production API, then publishes it to S3 and invalidates CloudFront.

The stack uses Lambda, API Gateway, private S3/CloudFront, on-demand DynamoDB, Cognito, CloudWatch alarms, SNS, and an AWS monthly Budget. API Gateway detailed route metrics are disabled.

## Production budget alerts

The monthly AWS Budget has a `$30` limit and sends actual-spend alerts when costs exceed `$10` and `$22` to both `pratikbawkar33@gmail.com` and `sachin9890@gmail.com`. Confirm the SNS email subscription for each address after the first apply. AWS Budgets sends alerts; it does not stop resources or enforce a hard spending cap.

## First production deployment

1. Configure local AWS credentials with `aws configure` or an AWS SSO profile. Keep credentials outside the repository.
2. Create a private, versioned S3 bucket in `ap-south-1` for Terraform state. Use a globally unique name and enable encryption and S3 Block Public Access. The production backend uses S3 state locking.
3. Build the ARM64 Lambda package from the repository root in Linux or WSL:

   ```bash
   bash infrastructure/scripts/package-lambda.sh
   ```

4. Initialize and apply production from the repository root, substituting the state bucket you created:

   ```bash
   terraform -chdir=infrastructure/terraform/environments/prod init \
     -backend-config="bucket=YOUR_STATE_BUCKET" \
     -backend-config="key=skill-orbit/prod/terraform.tfstate" \
     -backend-config="region=ap-south-1" \
     -backend-config="encrypt=true" \
     -backend-config="use_lockfile=true"
   terraform -chdir=infrastructure/terraform/environments/prod fmt -check
   terraform -chdir=infrastructure/terraform/environments/prod validate
   terraform -chdir=infrastructure/terraform/environments/prod plan -out=tfplan
   terraform -chdir=infrastructure/terraform/environments/prod apply tfplan
   ```

The production Terraform variables include the requested alert addresses and `$30` budget by default. Local `*.tfvars`, Terraform state, and plan files are ignored by Git.

## GitHub Actions production deployment

The `Production CD` workflow runs after a push to `main`. It calls the same CI workflow as a required quality gate, then uses GitHub OIDC to assume an AWS deployment role. Configure the `production` GitHub Actions environment with:

- Secret `AWS_PRODUCTION_ROLE_ARN`: the ARN of an AWS IAM role trusted for this repository's GitHub OIDC identity.
- Variable `TF_STATE_BUCKET`: the S3 state bucket created above.

The IAM role needs permission to manage the Terraform resources in the production stack, use the state bucket and lock file, upload/delete frontend objects, and invalidate the CloudFront distribution. Restrict its OIDC trust to this repository and the `main` branch / `production` environment. Do not store AWS access keys in GitHub or in the repository.

The repository uses `main` as the production branch. Merge or push changes to `main` to trigger deployment; CI must pass before the deployment job starts.

## Application limits

The deployed application still uses mock authentication, in-memory repositories, and the Bedrock mock. The AWS Cognito and DynamoDB resources exist in Terraform but are not yet integrated with application persistence or authentication. `USE_BEDROCK_MOCK` remains enabled until that work is complete.

Terraform outputs include `frontend_url`, `api_url`, `frontend_bucket_name`, `cloudfront_distribution_id`, and `lambda_function_name`.
