Skill Orbit - Project Plan
1. Project identity
Product name: Skill Orbit
Repository: https://github.com/pratikbawkar/Skillgraph-ai
Live production application: https://d3g0zz1ejf4met.cloudfront.net/
Category: #social-good
Lane: #community
Mission
Skill Orbit helps students and early-career learners identify skill gaps for a target technical role and turn those gaps into a practical, project-based learning roadmap with measurable progress.
The MVP deliberately focuses on three roles:
1. Cloud Engineer
2. DevOps Engineer
3. Python Developer
The product is designed around measurable capability rather than an opaque AI-generated score.
2. Current implementation status
The project is now in the production + competition-submission stage.
Production status
- The application is deployed to AWS and is publicly reachable through CloudFront.
- Production frontend hosting uses a private S3 bucket behind CloudFront Origin Access Control.
- The API is exposed through API Gateway and backed by AWS Lambda running FastAPI through Mangum.
- Production admin authentication uses Amazon Cognito.
- The Cognito admin group controls administrative access to recommended-video editing.
- Recommended-video overrides are persisted in an on-demand DynamoDB table keyed by skillId.
- The production Lambda receives the admin-video table name and Cognito user-pool ID from Terraform.
- The Lambda role is restricted to the required DynamoDB operations on the admin-video table and AdminListGroupsForUser on the Cognito user pool.
- The current Terraform configuration intentionally keeps USE_BEDROCK_MOCK=true; no live Bedrock model call should be claimed as part of the deployed MVP.
- The application remains production-only; no staging deployment is maintained.
Verified quality status
The final local validation before the production push included:
- Terraform formatting: passed.
- Terraform validation: passed.
- Backend Ruff: passed.
- Backend Mypy: passed.
- Backend Bandit: passed.
- Backend tests: 55 passed, 96.96% coverage.
- Frontend TypeScript: passed.
- Frontend lint: passed.
- Frontend npm audit: 0 vulnerabilities.
- Frontend tests: 56 passed.
- Frontend coverage: 86.34% statements, 80.39% branches, 87.34% functions, 88.48% lines.
- Production CI completed successfully.
- Production CD completed successfully.
- Production admin login was manually verified with Cognito.
- The production admin account was added to the admin group and successfully authenticated.
pip-audit was not included in the final local validation because backend dependencies were not changed during the final admin-content implementation. CI still contains the dependency-audit step and should remain the authoritative pre-merge gate.
3. Product loop
Assess
  ↓
Identify skill gaps
  ↓
Follow the role skill roadmap
  ↓
Learn / practice
  ↓
Complete practical skill tasks
  ↓
Recalculate deterministic progress
  ↓
See updated skill graph / roadmap
  ↓
Take the next recommended action
The product goal is to turn learning into measurable capability rather than simply listing courses or videos.
4. MVP requirements
Roles
Support exactly three curated target roles:
- Cloud Engineer
- DevOps Engineer
- Python Developer
Progress
Every selected role must show:
- an overall progress percentage;
- an individual progress bar and percentage for every skill;
- the components that contributed to each skill's progress.
The scoring model is deterministic and transparent:
Self assessment       20%
Objective quiz        30%
Practical tasks       50%
--------------------------
Skill progress        100%
The same formula is used for every user. Personalization affects recommendations and task selection, not the scoring formula.
Skill information
Every skill has an i control that opens the skill-detail experience.
The skill detail experience includes a recommended learning resource.
Recommended learning resources
Each skill has one curated YouTube resource.
The resource contains, at minimum:
- skill identifier;
- video title;
- YouTube URL;
- optional note;
- content-owner metadata where applicable.
The application must not silently replace a curated URL with an AI-generated resource.
Production administration for these resources uses Cognito + API Gateway/Lambda + DynamoDB.
5. Production admin-content architecture
Admin login
   ↓
Amazon Cognito
   ↓
Access token
   ↓
Skill Orbit frontend
   ↓
API Gateway
   ↓
Lambda / FastAPI
   ↓
Verify Cognito token + admin group
   ↓
DynamoDB admin-videos table
API contract
GET    /content/skills/{skill_id}/video
PUT    /content/skills/{skill_id}/video
DELETE /content/skills/{skill_id}/video
GET is used to retrieve a persisted override.
PUT and DELETE require a bearer access token and membership in the Cognito admin group.
The frontend also checks the Cognito cognito:groups claim to decide whether to expose the admin UI. This is a UI check only; the backend independently enforces authorization.
Local-development fallback
When NEXT_PUBLIC_API_BASE_URL is empty, the original local mock login and localStorage video overrides remain available for development.
The local fallback must never be configured as the production authentication mechanism.
6. AWS architecture
Internet
   ↓
CloudFront
   ↓
Private S3 bucket
(static Next.js export)

Frontend → API Gateway HTTP API
              ↓
           Lambda
        FastAPI + Mangum
          ├── Cognito admin authentication / authorization
          ├── DynamoDB admin-video overrides
          ├── existing application APIs
          └── CloudWatch logging

Terraform manages the AWS production stack.
GitHub Actions assumes AWS through GitHub OIDC.
Cost-conscious decisions
- Production only; no staging environment.
- S3 is private and accessed through CloudFront OAC.
- CloudFront uses PriceClass_100.
- DynamoDB tables use on-demand billing.
- Admin-video point-in-time recovery is enabled in production.
- API detailed route metrics remain disabled to avoid unnecessary CloudWatch metric cost.
- Bedrock is mocked for the current deployment.
7. Infrastructure as Code
Terraform is the source of truth for the production AWS resources.
The production module defines or manages:
- S3 frontend bucket;
- S3 public-access blocking;
- CloudFront Origin Access Control;
- CloudFront distribution;
- CloudFront viewer-request routing function;
- API Gateway HTTP API;
- Lambda execution role and function;
- DynamoDB users/progress tables already present in the application infrastructure;
- DynamoDB admin-videos table;
- Cognito user pool;
- Cognito public web client;
- Cognito admin group;
- Lambda IAM permissions;
- CloudWatch logs and alarms;
- SNS notifications;
- AWS budget controls where configured.
Production Terraform state is stored in the dedicated S3 state bucket and uses Terraform's native S3 lock file mechanism.
8. CI/CD delivery model
develop
   ↓
GitHub Actions CI
   ├── backend lint/type/security/tests
   ├── frontend lint/type/tests/audit
   ├── coverage
   └── Terraform validation
   ↓
reviewed promotion to main
   ↓
Production CD
   ├── CI quality gates
   ├── GitHub OIDC → AWS
   ├── Terraform init/apply
   ├── production frontend build
   ├── S3 sync
   └── CloudFront invalidation
   ↓
Live AWS application
Main remains the production branch. Production deployment must only happen from main.
CI must run before production deployment.
Production deployment must remain repeatable and Terraform-managed.
9. Major engineering problems solved
Terraform backend region failure
The S3 backend initially failed because the AWS region was not supplied.
Resolution: explicitly configure ap-south-1 during production Terraform initialization.
GitHub OIDC trust failure
GitHub Actions initially could not assume the production AWS role because the trust policy did not match the exact GitHub repository/environment identity.
Resolution: restrict the OIDC trust relationship to the intended repository and production environment and use the correct sts.amazonaws.com audience.
Missing Terraform IAM capability
Terraform needed to inspect attached IAM policies during deployment.
Resolution: add the required iam:ListAttachedRolePolicies permission to the deployment role policy.
CloudFront clean-route failure
Next.js static-export routes such as /roles/cloud-engineer were treated as direct S3 objects instead of /roles/cloud-engineer/index.html.
Resolution: add a CloudFront Function that rewrites extensionless routes to their exported index.html object and return a real 404 for missing content.
Frontend dependency conflict
npm ci failed because the ESLint configuration did not match the project's Next.js/ESLint dependency versions.
Resolution: align eslint-config-next with the chosen Next.js version and regenerate the lockfile.
Slow frontend tests
Two RoleSkillsBoard tests exceeded the existing local timeout.
Resolution: increase the timeout only for the affected tests rather than globally weakening test timing.
Coverage gap
Initial frontend coverage was below the desired threshold.
Resolution: add targeted API, skill-detail, admin-store, and admin-page tests instead of lowering the quality gate.
Malformed AWS CLI Lambda payload
An early Lambda CLI invocation failed because the JSON payload was malformed.
Resolution: correct the JSON payload and re-run the invocation.
API Gateway 429 during debugging
The API returned HTTP 429 during early endpoint testing.
Resolution: inspect the deployed API Gateway stage/route configuration and remove configuration confusion before continuing production verification.
Admin video persistence gap
The original admin feature stored overrides in browser localStorage, which meant changes were not shared across users.
Resolution: move production overrides to DynamoDB and protect writes with Cognito group authorization.
Stale local Python tool launchers
mypy.exe, bandit.exe, and pytest.exe still referenced an older Skillgraph-ai virtual-environment path after the project directory changed.
Resolution: invoke the installed tools through the active Python interpreter using python -m ....
10. Quality gates
Backend
Required checks:
ruff check app tests
mypy app --ignore-missing-imports --no-error-summary
bandit -r app --severity-level=medium
pytest --cov=app --cov-fail-under=80 tests/
pip-audit --desc
Frontend
Required checks:
npm ci
npx tsc --noEmit
npm run lint
npm audit --audit-level=moderate
npm run test -- --run --coverage
Infrastructure
Required checks:
terraform fmt -check -recursive
terraform validate
Production must not be deployed when CI quality gates fail.
11. Competition submission readiness
AWS Builder Zero to Shipped requires the submission to include:
- a live application on AWS reachable through a public URL;
- documented proof that a coding agent was connected to the AWS console;
- a published AWS Builder Center project describing the application, development process, and use of the coding agent;
- one app category tag;
- one focus-lane tag;
- an original application that meets the hackathon's originality requirement;
- documentation of AWS services and coding-agent use.
Selected classification
Category: #social-good
Lane:    #community
Submission evidence to attach or link
1. Live AWS URL.
2. Public GitHub repository.
3. Screenshot/log proving the coding agent connection to the AWS console.
4. Screenshot of a successful GitHub Actions CI run.
5. Screenshot/log of the successful Production CD run.
6. Terraform validation/deployment evidence where useful.
7. Production architecture diagram.
8. Screenshots of the core product flow.
9. Screenshot of production Cognito admin login and recommended-video editing, without exposing passwords or tokens.
10. Final test/coverage summary.
Do not publish credentials, access tokens, private AWS information, GitHub secrets, or local .env.local contents in the submission.
12. AI-assisted development record
Claude Code
Used as a repository-level coding agent for coordinated implementation across frontend, backend, Terraform, tests, and deployment-related files.
GitHub Copilot
Used for inline implementation assistance, code completion, test generation, and repetitive coding work.
OpenAI / Codex / Chat Codex
Used for architecture reasoning, debugging, code review, failure analysis, command-by-command validation, and deployment troubleshooting.
GitHub Actions
Used as the automation engine for CI/CD. It is not itself a coding agent; it executes the project's automated quality gates and production deployment workflow.
For the AWS Builder submission, identify the specific agent that was connected to the AWS console and attach the actual screenshot/log evidence for that connection.
13. Final readiness checklist
- [x] Application is live on AWS.
- [x] Public CloudFront URL verified.
- [x] Production admin login works through Cognito.
- [x] Cognito admin group exists and was verified.
- [x] Recommended-video overrides persist in DynamoDB.
- [x] Production deployment completed through CI/CD.
- [x] Terraform formatting and validation passed.
- [x] Backend tests passed above the required coverage.
- [x] Frontend tests passed above the required coverage.
- [x] npm audit reported zero vulnerabilities.
- [x] Production/local authentication paths are separated.
- [x] Local credentials are excluded from Git.
- [ ] Add the actual AWS-console coding-agent proof to submission materials.
- [ ] Ensure the final submission article is published on AWS Builder Center.
- [ ] Ensure the final category/lane tags are applied on Builder Center.
14. Documentation synchronization requirement
Before the final competition submission, keep plan.md, README.md, workflow files, and the actual AWS deployment model consistent.
Do not leave older references that claim:
- Vercel is the current production platform;
- production AWS deployment is still unverified;
- Cognito is not integrated;
- admin video overrides are localStorage-only;
- AWS resources are merely proposed.
The public repository should describe the same production architecture and deployment flow that the judges can actually reach through the live application.