# Skill Orbit — Project Plan

## 1. Project Overview

**Product name:** Skill Orbit
*(Older code and planning references may say SkillGraph AI.)*

**Repository directory:** `Skill-Orbit`

**Category:** `#social-good`

**Lane:** `#community`

**Primary goal:**
Help students and early-career learners identify skill gaps for a target role and turn those gaps into a practical, project-based learning roadmap with measurable skill progress.

### Current implementation status (repository snapshot)

This section records what is present in the repository; it does not claim that cloud resources have been applied or that a public deployment is live.

* The frontend is a Next.js, TypeScript, Tailwind application configured for static export. Mock data is the default; its API client can be configured to call the FastAPI API.
* The backend is a FastAPI application with mock HMAC authentication, in-memory user/progress repositories, seeded role data, deterministic progress scoring, and practical-task completion tracking. It does not yet use Cognito, DynamoDB, or Bedrock.
* A Mangum Lambda entry point and Terraform configuration for staging and production exist. The Terraform configuration describes a private S3/CloudFront frontend, API Gateway HTTP API, Lambda, DynamoDB tables, Cognito user pool/client, CloudWatch log group/alarms, SNS notifications, and optional AWS Budgets. S3 is used for the static frontend and is not used for user evidence/file storage in the MVP. Their existence in code is not evidence that they have been applied in AWS.
* The Lambda package script targets Python 3.11 on Linux ARM64. The Terraform Lambda environment currently sets `USE_BEDROCK_MOCK=true`.
* GitHub Actions currently runs CI for pull requests and pushes to `develop`. The CD workflow runs on pushes to `main` and attempts a Vercel deployment. It does not currently deploy the Terraform/AWS stack, and its smoke-test job does not make application health/API requests.
* The repository currently has frontend component tests and backend unit/integration tests. Playwright E2E tests, k6 performance scripts, and architecture/ADR documentation are planned but are not present in the tracked source tree.
* The current application is still at the Phase 1 application-readiness stage. AWS infrastructure definitions have been added ahead of completion of the production application integration; that does not satisfy Phase 2 exit criteria. Treat all AWS resources as proposed/configured in Terraform until a deployment is independently verified.

### Core product loop

```text
Assess
   ↓
Identify skill gaps
   ↓
Generate learning roadmap
   ↓
Learn / Practice
   ↓
Complete practical skill tasks
   ↓
Recalculate skill progress
   ↓
Update skill graph
   ↓
Recommend next action
```

The product should focus on turning learning into **measurable capability**, not simply recommending courses.

---

## 2. Product Goals

### MVP goals

1. User registration and authentication.
2. User profile containing current skills, target role, and learning availability.
3. Skill assessment.
4. Deterministic skill-gap calculation.
5. Personalized AI-assisted roadmap.
6. Project-based learning recommendations.
7. Practical skill tasks/checkpoints that users can complete to demonstrate progress.
8. Progress dashboard.
9. Production AWS deployment with a public URL.
10. Automated CI/CD with strong testing, linting, security checks, and Codecov.
11. Support exactly three curated target roles for the MVP:

    * Cloud Engineer
    * DevOps Engineer
    * Python Developer
12. Show an overall role-progress percentage for every user.
13. Show an individual progress bar and percentage for every skill in the selected role.
14. Provide an `i` (information) control for every skill that opens skill details and one admin-curated YouTube learning resource.
15. Keep skill-progress calculations transparent and explainable; do not use an opaque LLM-generated score as the sole source of progress.

### MVP skill-progress model

The progress calculation must be deterministic and visible to the user.

The MVP skill-progress model is:

```text
Self assessment       20%

Objective quiz        30%

Practical tasks       50%

--------------------------

Skill progress        100%
```

### Progress rules

* A missing component contributes `0` until the user completes it.
* Each skill has a small set of predefined practical tasks/checkpoints.
* The MVP should use approximately 1–3 practical tasks per skill.
* A practical task represents a concrete learning or implementation action.
* Completing a practical task increases the practical-task component of the skill progress.
* The UI must show which components contributed to the current percentage.
* Practical task completion must be deterministic and transparent.
* The same scoring formula is used for every user.
* Personalization affects recommendations and task selection, not the scoring formula.
* The weights may be revised later only through a documented product decision / ADR.
* The overall role-progress percentage is derived from the progress of the skills required by that role.

### Practical task examples

Examples of MVP practical tasks include:

```text
Create an S3 bucket
Write a basic Lambda function
Create a Docker image
Write a Python function using exception handling
Create an IAM policy
Deploy a simple application
Write a basic Terraform resource
Create a GitHub Actions workflow
```

These are examples only. The final tasks should be curated according to each role and skill.

### Practical task MVP rules

* Users can mark a task as completed.
* Completion automatically recalculates the related skill percentage.
* The updated skill percentage is reflected in the selected role's overall progress.
* Repeated completion of an already-completed task must not increase the score incorrectly.
* The backend must calculate progress deterministically.
* MVP task tracking does not require file uploads, GitHub repository analysis, portfolio verification, or external evidence processing.
* Practical tasks are a lightweight progress mechanism rather than a separate evidence-management system.

### Overall role progress

The overall role-progress percentage is derived from the progress of the skills required by that role.

The MVP must not use:

* An LLM-generated overall score.
* An opaque AI confidence score.
* Arbitrary AI weighting.

The calculation must be explainable from the underlying skill percentages.

### MVP learning resources

Each skill in the curated skill graph must have one admin-managed recommended YouTube resource. The MVP does not require YouTube search integration.

Each skill resource record should contain at minimum:

* Skill identifier.
* Video title.
* YouTube URL.
* Optional short reason/recommendation note.
* Admin/content owner metadata.

Users access the resource through the skill's `i` button.

AI must not silently replace or invent the curated URL.

### Non-goals for MVP

Do not attempt to support:

* Every career.
* Every technology.
* Every learning provider.
* File-upload-based evidence collection.
* GitHub evidence analysis.
* Portfolio verification.
* Automated evidence evaluation.
* Complex learner verification systems.
* Large-scale learning-provider integrations.

Start with a small, curated set of target roles and a high-quality skill graph.

---

## 3. Three-Phase Delivery Plan

The phase definitions below are the intended delivery gates. The repository contains some later-phase Terraform groundwork, but that groundwork does not mean the product has passed the Phase 1 exit criteria or completed an AWS deployment. Keep the current application behavior and verified deployment state explicit when updating this plan.

### Phase 1 — Local Development + Vercel Validation

**Status:** In progress.

The frontend and backend have local development setups and automated unit/component/API tests. Vercel is configured for a static frontend with mock data. The critical user journey, a verified Vercel deployment, live smoke checks, and the full plan quality gates still require evidence before Phase 1 can be called complete.

Goal: validate the product, UX, API behavior, AI seams, and automated testing before relying on AWS production services.

```text
Local frontend + FastAPI backend
(mock/in-memory defaults)
        ↓
Unit + integration + frontend tests
and quality checks
        ↓
GitHub Actions CI on develop PRs/pushes
        ↓
Vercel frontend validation deployment
(mock data by default)
        ↓
Public test application
+ real smoke/E2E verification
```

#### Rules

* Build and validate locally first.
* Use Vercel only as a Phase 1 frontend validation/demo environment.
* Do not introduce Vercel-specific services or architecture that makes AWS migration harder.
* Keep application logic and API contracts portable to AWS.
* Record the actual Vercel project root, deployment branch, environment variables, URL, and verification evidence.
* The deployment guide and workflow must agree before treating this gate as complete.

#### Phase 1 exit criteria

* Core user journeys work locally against the intended mock or local API configuration.
* CI passes with the required lint, type, test, security, and coverage gates.
* Critical Playwright E2E flows pass.
* Vercel deployment is publicly reachable and its deployment branch/configuration is verified.
* Real smoke tests pass against the deployed application.
* The critical MVP flow works:

  * Register/Login
  * Create profile
  * Select target role
  * Complete assessment
  * Generate roadmap
  * Complete a practical task
  * Verify skill progress updates
  * View dashboard

### Phase 2 — AWS Deployment + Public Production

**Status:** Terraform foundation exists for `staging` and `prod`; application integration and verified deployment remain incomplete.

Goal: deploy the validated application to the planned low-cost AWS serverless architecture and expose it publicly.

```text
Phase 1 validated application
        ↓
Review Terraform plan for staging
        ↓
Deploy and integrate AWS services
        ↓
Staging smoke + E2E verification
        ↓
Human approval / production plan review
        ↓
Terraform-managed production deployment
        ↓
Production smoke + critical E2E verification
```

#### Rules

* Reuse validated application behavior from Phase 1.
* Provision permanent AWS infrastructure through Terraform.
* Review every plan before applying, especially production.
* Keep the AWS architecture serverless and cost-conscious.
* Do not add EC2, EKS, RDS, NAT Gateway, ALB, Managed Prometheus, or Managed Grafana unless a documented requirement appears.
* Integrate and verify Cognito authentication and durable DynamoDB repositories before describing those services as application capabilities.
* Implement the required Bedrock roadmap/recommendation capability before describing live Bedrock behavior as implemented.
* Run CI before every deployment.
* Perform real post-deployment verification after every deployment.
* The AWS production application must be publicly reachable.

#### Phase 2 exit criteria

* Terraform plan is reviewed and applied successfully in staging and production.
* Production AWS deployment succeeds and its public URL is verified.
* Authentication uses the intended Cognito integration.
* Core API and database operations use durable AWS-backed repositories.
* Bedrock-backed roadmap/recommendation behavior is implemented, permission-scoped, and verified if it remains an MVP requirement.
* Practical task completion and deterministic skill-progress updates work with the AWS-backed application.
* Production smoke tests and critical production E2E tests pass.
* CloudWatch logging, required alarms, alert subscriptions, and AWS budget controls are configured and verified.

### Phase 3 — Production Hardening + Competition Submission

Goal: make the live AWS application secure, reliable, cost-controlled, and ready for judging.

#### Focus

* Security hardening and least-privilege IAM.
* Controlled performance testing with k6.
* Error handling and resilience.
* Cost optimization.
* CloudWatch log/metric review and alarms.
* Production documentation and architecture diagrams.
* AI-assisted development story and evidence.
* CI/CD and Codecov evidence.
* AWS coding-agent connection evidence.
* Final public URL verification.
* Competition category/lane tags and submission materials.

#### Phase 3 exit criteria

* No critical security findings remain.
* Production CI/CD is repeatable and includes genuine deployment verification.
* Regression tests pass.
* Cost controls are documented and active.
* README and architecture documentation are complete.
* Live AWS URL is stable and publicly reachable.
* Competition evidence is complete.

**Important distinction:** competition/submission evidence refers to project development and competition requirements. It is not a user-facing Skill Orbit MVP feature.

---

## 4. Final Technology Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Vitest
* React Testing Library
* Playwright

### Backend

* Python
* FastAPI
* Pydantic
* Boto3
* pytest
* httpx
* moto
* Mangum

### AWS

* Amazon S3
* Amazon CloudFront
* Amazon API Gateway (HTTP API)
* AWS Lambda
* Amazon DynamoDB
* Amazon Cognito
* Amazon Bedrock
* Amazon CloudWatch

### Infrastructure / DevOps

* Terraform
* GitHub Actions
* Docker for local development and CI where useful
* GitHub Container Registry or Amazon ECR only if a container image is actually required

### Quality / Security / Testing

* Codecov
* pytest
* Vitest
* React Testing Library
* Playwright
* k6
* Bandit
* pip-audit
* npm audit (or equivalent dependency audit)
* Trivy
* Terraform fmt / validate / plan

### AI-assisted development

* Claude Code
* GitHub Copilot
* OpenAI / Codex

---

## 5. AWS Architecture

### Intended target architecture

The target application is a cost-efficient serverless system. The diagram describes the intended integrated system, not the current application behavior.

```text
Internet
   ↓
CloudFront → private S3 static frontend
   ↓
API Gateway HTTP API
   ↓
Lambda (Mangum → FastAPI)
   ├── Cognito authentication
   ├── DynamoDB users + progress + task completion
   ├── Bedrock controlled model calls
   └── CloudWatch logs + alarms → SNS alerts
```

S3 is used for static frontend hosting in the MVP.

The MVP does not require S3-based user evidence or artifact storage.

### Current infrastructure configuration in Terraform

`infrastructure/terraform/modules/application` currently defines:

* A private S3 bucket for the static frontend, CloudFront Origin Access Control, and a CloudFront distribution using the default certificate and `PriceClass_100`.
* An API Gateway HTTP API with a `$default` route to a Python 3.11 ARM64 Lambda using `handler.handler` and payload format 2.0.
* On-demand DynamoDB users and progress tables. Point-in-time recovery is enabled only for `prod`.
* A Cognito user pool and public web client.
* A Lambda execution role with CloudWatch log writes and DynamoDB read/write/query permissions. Bedrock `InvokeModel` is added only when model ARNs are configured.
* A CloudWatch log group with environment-specific retention:

  * 7 days staging
  * 30 days prod
* Lambda/API 5xx alarms.
* An SNS alert topic.
* Optional budget-email subscription.
* An optional monthly AWS Budget. Its current notifications are `$10` actual spend, `$20` actual spend, and `$25` forecasted spend.

Terraform defines staging and production roots in:

```text
infrastructure/terraform/environments/
```

The example variables default to `ap-south-1`.

The email, Bedrock model ARNs, and additional CORS origins are configurable.

Terraform state is local by default according to the infrastructure README. Shared/production use requires a deliberate remote-state and locking setup.

### Current application integration gaps

* `backend/app` uses in-memory repositories and mock token auth. The Cognito resources are not wired into the app's auth flow.
* The app does not yet read/write DynamoDB. S3 is used for static frontend hosting and is not part of the MVP product-data flow.
* The Terraform Lambda role grants DynamoDB access, but that does not create application persistence.
* `USE_BEDROCK_MOCK` is true in Terraform. Setting it false currently raises `NotImplementedError`; there is no Bedrock client integration yet.
* The static frontend supports build-time API configuration, but Vercel is set to use mocks.
* AWS publishing steps are documented in the Terraform README; no GitHub Actions AWS deploy workflow currently performs them.
* Do not claim AWS resources are live or the public AWS application is deployed without checking the AWS account and de
