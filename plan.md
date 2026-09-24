# SkillGraph — Project Plan

## 1. Project Overview

**Project name:** SkillGraph AI  
**Repository:** `skillgraph-ai`  
**Category:** `#social-good`  
**Lane:** `#community`  
**Primary goal:** Help students and early-career learners identify skill gaps for a target role and turn those gaps into a practical, project-based learning roadmap with measurable evidence of progress.

### Core product loop

```text
Assess
  ↓
Identify skill gaps
  ↓
Generate learning roadmap
  ↓
Practice / Build project
  ↓
Submit evidence
  ↓
Evaluate evidence
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
7. Evidence submission and evaluation.
8. Progress dashboard.
9. Production AWS deployment with a public URL.
10. Automated CI/CD with strong testing, linting, security checks, and Codecov.
11. Support exactly three curated target roles for the MVP: Cloud Engineer, DevOps Engineer, and Python Developer.
12. Show an overall role-progress percentage for every user.
13. Show an individual progress bar and percentage for every skill in the selected role.
14. Provide an `i` (information) control for every skill that opens skill details and one admin-curated YouTube learning resource.
15. Keep skill-progress calculations transparent and explainable; do not use an opaque LLM-generated score as the sole source of progress.

### MVP skill-progress model

The progress calculation must be deterministic and visible to the user. The initial skill-progress model is:

```text
Self assessment     20%
Objective quiz       30%
Practical project    30%
Evidence submitted   20%
--------------------------
Skill progress       100%
```

Rules:
- A missing component contributes `0` until the user completes it.
- The UI must show which components contributed to the current percentage.
- The weights may be revised later only through a documented product decision / ADR.
- The overall role-progress percentage is derived from the progress of the skills required by that role.
- The MVP should use the same deterministic calculation for every user; personalization affects recommendations, not the scoring formula.

### MVP learning resources

Each skill in the curated skill graph must have one admin-managed recommended YouTube resource. The MVP does not require YouTube search integration.

Each skill resource record should contain at minimum:
- Skill identifier.
- Video title.
- YouTube URL.
- Optional short reason/recommendation note.
- Admin/content owner metadata.

Users access the resource through the skill's `i` button. AI must not silently replace or invent the curated URL.

### Non-goals for MVP

Do not attempt to support every career, every technology, or every learning provider.
Start with a small, curated set of target roles and a high-quality skill graph.

---

## 3. Three-Phase Delivery Plan

The project must be built and shipped in three explicit phases. Do not move to AWS production infrastructure until the previous phase meets its exit criteria.

### Phase 1 — Local Development + Vercel Validation

Goal: validate the product, UX, API behavior, AI flows, and automated testing before introducing AWS production infrastructure.

```text
VS Code
  ↓
Claude Code + GitHub Copilot + OpenAI/Codex
  ↓
Local development
  ↓
Unit + integration + E2E + security tests
  ↓
GitHub Actions + Codecov
  ↓
Vercel validation deployment
  ↓
Public test application
```

Rules:
- Build and test locally first.
- Use Vercel only as the Phase 1 validation/demo environment.
- Do not introduce Vercel-specific services or architecture that makes AWS migration harder.
- Keep application logic and API contracts portable to AWS.
- Validate the complete critical user journey on the public Vercel deployment.

Phase 1 exit criteria:
- Core user journeys work locally.
- CI passes.
- Codecov quality gate passes.
- Linting, formatting, type checks, and applicable security checks pass.
- Critical Playwright E2E flows pass.
- Vercel deployment is publicly reachable.
- Smoke tests pass against Vercel.

### Phase 2 — AWS Deployment + Public Production

Goal: deploy the validated application to the planned low-cost AWS serverless architecture and expose it publicly.

```text
Validated Vercel application
          ↓
       Terraform
          ↓
      AWS resources
          ↓
CloudFront + S3
          ↓
    API Gateway
          ↓
       Lambda
          ↓
 ┌────────┼─────────┐
 ▼        ▼         ▼
DynamoDB S3      Bedrock
          │
       Cognito
          │
      CloudWatch
```

Rules:
- Reuse the validated application behavior from Phase 1.
- Provision permanent AWS infrastructure through Terraform.
- Keep the AWS architecture serverless and cost-conscious.
- Do not add EC2, EKS, RDS, NAT Gateway, ALB, Managed Prometheus, or Managed Grafana unless a documented requirement appears.
- Run CI before every deployment and post-deployment verification after every deployment.
- The AWS production application must be publicly reachable.

Phase 2 exit criteria:
- Terraform plan is reviewed and applied successfully.
- Production AWS deployment succeeds.
- Authentication works.
- Core API and database operations work.
- Bedrock-backed roadmap generation works.
- Production smoke tests pass.
- Critical production E2E tests pass.
- CloudWatch logging and required alarms are configured.
- AWS budget and billing alerts are active.

### Phase 3 — Production Hardening + Competition Submission

Goal: make the live AWS application secure, reliable, cost-controlled, and ready for judging.

Focus:
- Security hardening and least-privilege IAM.
- Controlled performance testing with k6.
- Error handling and resilience.
- Cost optimization.
- CloudWatch log/metric review and alarms.
- Production documentation and architecture diagrams.
- AI-assisted development story and evidence.
- CI/CD and Codecov evidence.
- AWS coding-agent connection evidence.
- Final public URL verification.
- Competition category/lane tags and submission materials.

Phase 3 exit criteria:
- No critical security findings remain.
- Production CI/CD is repeatable.
- Regression tests pass.
- Cost controls are documented and active.
- README and architecture documentation are complete.
- Live AWS URL is stable and publicly reachable.
- Competition evidence is complete.

## 4. Final Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Vitest
- React Testing Library
- Playwright

### Backend

- Python
- FastAPI
- Pydantic
- Boto3
- pytest
- httpx
- moto

### AWS

- Amazon S3
- Amazon CloudFront
- Amazon API Gateway (HTTP API)
- AWS Lambda
- Amazon DynamoDB
- Amazon Cognito
- Amazon Bedrock
- Amazon CloudWatch

### Infrastructure / DevOps

- Terraform
- GitHub Actions
- Docker for local development and CI where useful
- GitHub Container Registry or Amazon ECR only if a container image is actually required

### Quality / Security / Testing

- Codecov
- pytest
- Vitest
- React Testing Library
- Playwright
- k6
- Bandit
- pip-audit
- npm audit (or equivalent dependency audit)
- Trivy
- Terraform fmt / validate / plan

### AI-assisted development

- Claude Code
- GitHub Copilot
- OpenAI / Codex

---

## 5. AWS Architecture

The application is designed as a cost-efficient serverless system.

### Backend: Lambda with Mangum/FastAPI

```text
API Gateway HTTP API
        ↓
      Lambda
        ↓
  Mangum ASGI Adapter
        ↓
    FastAPI app
```

The backend is a standard FastAPI application wrapped with Mangum (an ASGI-to-Lambda adapter). This allows the same FastAPI code to run:
- Locally with `uvicorn app.main:app --reload`
- In Phase 2 AWS Lambda via `handler.handler` (see `backend/handler.py`)
- Without any Lambda-specific decorators or changes to core business logic

The handler is already prepared in `backend/handler.py` and will be deployed to AWS Lambda during Phase 2.

### Full application architecture

```text
                        INTERNET
                           │
                           ▼
                  CloudFront + S3
                    Next.js UI
                           │
                           ▼
                   API Gateway HTTP API
                           │
                           ▼
                        Lambda
                           │
                       Mangum
                           ↓
                      FastAPI app
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          DynamoDB         S3        Bedrock
              │
              ▼
           Cognito

          CloudWatch
        Logs + Alarms
```

### Architecture rules

- Do not add EC2, EKS, RDS, NAT Gateway, ALB, Managed Prometheus, or Managed Grafana unless there is a specific documented requirement.
- Prefer AWS serverless services for the MVP.
- Keep Bedrock usage controlled and observable.
- Use IAM least privilege.
- Use CloudWatch for AWS logs and operational monitoring.
- Do not introduce infrastructure simply for demonstration if it increases cost without product value.
- Backend code is Lambda-compatible via Mangum; no Lambda-specific business logic should appear in `app/`.

---

## 6. Repository Structure

The repository should evolve toward this structure:

```text
skillgraph-ai/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── tests/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── main.py
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── fixtures/
│
├── infrastructure/
│   └── terraform/
│       ├── modules/
│       ├── environments/
│       │   ├── dev/
│       │   ├── staging/
│       │   └── prod/
│       ├── providers.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── README.md
│
├── e2e/
│   └── playwright/
│
├── performance/
│   └── k6/
│
├── docs/
│   ├── architecture/
│   ├── decisions/
│   └── development/
│
├── .github/
│   ├── workflows/
│   ├── pull_request_template.md
│   └── dependabot.yml
│
├── README.md
├── plan.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CODEOWNERS
└── .gitignore
```

> If the actual implementation needs a different structure, update this plan before making a structural change.

---

## 7. Claude Code Sub-Agents

Claude Code is the primary repository-level agent. Use specialized sub-agents instead of one agent attempting every responsibility at once.

### 6.1 Architect Agent

Responsibilities:

- Requirements analysis.
- System architecture.
- API contracts.
- Data/access-pattern design for DynamoDB.
- ADRs (Architecture Decision Records).
- Review major technical changes before implementation.

Should not:

- Introduce unnecessary infrastructure.
- Make broad implementation changes without documenting the decision.

### 6.2 Backend Agent

Responsibilities:

- FastAPI implementation.
- Pydantic schemas.
- Lambda-compatible backend code.
- DynamoDB repositories/services.
- Bedrock integration.
- Backend unit/integration tests.
- Backend linting and type checking.

### 6.3 Frontend/Test Agent

Responsibilities:

- Next.js UI.
- TypeScript components.
- Accessibility and responsive behavior.
- Vitest/React Testing Library tests.
- Playwright E2E tests.
- Frontend linting and type checking.

### 6.4 AWS/DevOps Agent

Responsibilities:

- Terraform.
- AWS IAM and infrastructure configuration.
- GitHub Actions CI/CD.
- Deployment workflows.
- Security scanning.
- Environment configuration.
- CloudWatch logging/alarms.
- Deployment smoke tests.

### Agent coordination rule

For work that spans multiple domains, the main Claude agent must:

1. Read this plan.
2. Identify the appropriate specialized agent(s).
3. Define the change and acceptance criteria.
4. Require tests and linting before the change is considered complete.
5. Review the final diff before opening a PR or merging.

---

## 8. Environment Strategy

### Git Branches (separable from deployment environments)

```text
main (production-ready)
  ↑
develop (active integration)
  ↑
feature/* (work-in-progress)
```

**Rules:**
- Feature work targets `develop` and must pass all CI gates.
- Release promotion targets `main`.
- Direct pushes to `main` are not allowed.
- Do **not** create long-lived Git branches for environments; use Terraform and deployment pipelines instead.

### Deployment Environments and Validation Flow

**Phase 1 — Local Development**
```
Local workstation
  ↓
VS Code / Claude Code / GitHub Copilot
  ↓
Local tests/linting/security checks
  ↓
Feature branch
```

**Phase 1 → Vercel Validation**
```
Feature branch
  ↓
Pull Request to develop
  ↓
CI quality gates (tests, lint, format, type-check, security)
  ↓
Merge to develop
  ↓
Vercel validation deployment (auto-deploys from develop)
  ↓
Public test URL (demo/validation phase)
  ↓
Smoke + E2E tests
```

**Phase 2 → AWS Deployment**
```
develop (validated in Vercel)
  ↓
AWS staging (Terraform-managed)
  ↓
Staging smoke + E2E tests
  ↓
Manual approval
  ↓
Promote to main
  ↓
AWS production (Terraform-managed)
  ↓
Production smoke + E2E tests
```

**Environment summary:**
- `local` — individual developer machine
- `vercel` — Phase 1 public validation
- `aws-staging` — Phase 2 staging (managed by Terraform)
- `aws-prod` — Phase 2 production (managed by Terraform)

One staging environment is sufficient for MVP. Both staging and production are provisioned through Terraform from the same code, differing only in variable values (environment-specific config).

---

## 9. Pull Request Policy — Mandatory

Every Pull Request must follow these rules.

### Before opening a PR

The author/agent must:

1. Pull/rebase the latest target branch.
2. Review the complete diff.
3. Run relevant tests locally.
4. Run linting locally.
5. Run formatting checks.
6. Run type checks where applicable.
7. Run security checks for changed areas.
8. Run Terraform validation for infrastructure changes.
9. Confirm no secrets or sensitive files are included.
10. Update documentation when behavior or architecture changes.
11. Verify all CI gates pass (do not bypass checks with `|| true`, `continue-on-error`, or `--no-verify`).

### PR destination rules

- Feature work targets `develop`.
- Release promotion targets `main`.
- Direct pushes to `main` are not allowed.
- Production deployments happen from the approved `main` pipeline.
- Do not open PRs against the wrong branch.
- When a task specifies a target branch, verify the target branch before creating the PR.
- **Agents may create and commit to PRs, but must NOT merge their own PR.** Human review is required.

### Every PR must include

- What changed (summary of files/logic modified).
- Why it changed (business reason or requirement).
- Tests added/updated and test command(s) run with results (PASS/FAIL).
- Lint, format, and type check results.
- Security checks run when applicable and results.
- Infrastructure impact when applicable (cost, resources, permissions).
- Screenshots for meaningful UI changes.
- Any intentionally deferred follow-up work.

### CI quality gates are not optional

Every PR must pass:
- All linting checks (no warnings bypassed)
- All formatting checks
- All type checks
- All unit + integration tests (minimum 80% coverage)
- All applicable security checks (bandit, pip-audit, npm audit)
- All Terraform validation (for infrastructure PRs)
- Codecov coverage gate

CI failures must be fixed, not bypassed. A PR cannot merge if CI fails.

---

## 10. Mandatory CI Pipeline

Every PR must trigger CI.

```text
Pull Request
   ↓
Install dependencies
   ↓
Format check
   ↓
Lint
   ↓
Type check
   ↓
Unit tests
   ↓
Integration tests
   ↓
Frontend tests
   ↓
E2E tests (where appropriate)
   ↓
Security scans
   ↓
Terraform fmt/validate/plan (when infrastructure changes)
   ↓
Coverage report
   ↓
Codecov
```

### CI quality gates

A PR should not be merged when:

- Tests fail.
- Required linting fails.
- Type checking fails.
- Required security checks fail.
- Terraform validation fails.
- Coverage quality gate fails.
- A secret/sensitive file is detected.

Target baseline:

- Overall code coverage: **80%+**.
- Critical business logic: **90%+** where practical.

Coverage is not the only quality measure. Tests must exercise meaningful behavior and failure paths.

---

## 11. Testing Strategy

### Backend

Cover at minimum:

- Valid API requests.
- Invalid input.
- Missing fields.
- Authentication failures.
- Authorization failures.
- Resource-not-found behavior.
- DynamoDB failures.
- S3 failures.
- Bedrock failures/timeouts.
- Duplicate operations.
- Edge cases.

### Frontend

Cover at minimum:

- Component rendering.
- Form validation.
- Loading states.
- Error states.
- Empty states.
- Authenticated/unauthenticated behavior.
- Critical user interactions.

### E2E

At minimum:

```text
Register/Login
   ↓
Create profile
   ↓
Select target role
   ↓
Complete assessment
   ↓
Generate roadmap
   ↓
View dashboard
```

### Performance

Use k6 for controlled tests after the core application is stable.

### Deployment verification

Every deployment should have smoke tests for:

- Frontend availability.
- Health endpoint.
- Authentication.
- Critical API endpoint.
- Database access.
- Core roadmap flow.

---

## 12. Security Rules — Mandatory

### Never commit sensitive data

**NEVER commit:**

- `.env` files.
- `.env.*` files containing secrets.
- AWS access keys.
- Secret keys.
- API keys.
- Tokens.
- Private certificates.
- Private keys.
- Passwords.
- Production credentials.
- Database credentials.
- Bedrock/API provider secrets.
- Cognito secrets.
- Terraform state containing sensitive values.

### No hardcoded values

Production code must not hardcode:

- Secrets.
- AWS credentials.
- API keys.
- Environment-specific URLs.
- Environment-specific resource IDs when they can be injected/configured.
- Passwords.
- Tokens.
- Private credentials.

Use appropriate configuration mechanisms instead:

- GitHub Actions Secrets / Variables.
- AWS IAM roles.
- AWS Systems Manager Parameter Store or Secrets Manager when secrets are required.
- Terraform variables and environment-specific configuration.
- Runtime environment variables for non-secret configuration.

### `.gitignore`

Ensure the repository ignores at least:

```text
.env
.env.*
!.env.example
*.pem
*.key
terraform.tfstate
terraform.tfstate.*
.terraform/
node_modules/
__pycache__/
.pytest_cache/
playwright-report/
coverage/
```

`.env.example` may contain placeholders only and must never contain real credentials.

### Pre-commit / CI secret scanning

Use secret scanning where available and fail CI when obvious secrets are detected.

---

## 13. Infrastructure Rules

Terraform is the source of truth for AWS infrastructure.

Do not create production AWS resources manually through the console when the resource should be managed by Terraform.

Exceptions are allowed for:

- Initial account-level setup.
- Temporary debugging.
- AWS service operations that intentionally remain outside Terraform.

Any console-created resource that becomes permanent must be documented and migrated into Terraform.

### Terraform workflow

```text
terraform fmt
terraform validate
terraform plan
terraform apply
```

Never apply production infrastructure blindly.

Review the plan before production changes.

---

## 14. CI/CD Deployment Flow

Phase 1 validation:

```text
feature/*
   ↓
Pull Request
   ↓
CI quality gates
   ↓
merge to develop
   ↓
Vercel validation deployment
   ↓
Smoke + integration + E2E
```

After Phase 1 is approved, AWS delivery follows:

```text
develop
   ↓
AWS staging deployment
   ↓
Smoke + integration + E2E
   ↓
Manual/controlled approval
   ↓
main
   ↓
AWS production deployment
   ↓
Production smoke tests
```

A deployment is not considered successful just because AWS accepted the deployment command.
The application must pass post-deployment verification.

---

## 15. AI Development Rules

AI tools are engineering assistants, not automatic authorities.

### GitHub Copilot

Use for:

- Boilerplate.
- Small functions.
- Tests.
- Refactoring.
- Type definitions.
- Documentation.

### Claude Code

Use for:

- Repository-wide implementation.
- Multi-file changes.
- Terraform and CI/CD.
- Debugging.
- Test-suite expansion.
- AWS integration.

### OpenAI / Codex

Use for:

- Architecture review.
- Difficult debugging.
- Security review.
- Test strategy.
- Code review.
- Documentation and planning.

### AI safety rule

An AI-generated change must still pass:

```text
Human review
  ↓
Tests
  ↓
Linting
  ↓
Security checks
  ↓
CI
  ↓
PR review
```

Never merge AI-generated code solely because the agent says it works.

---

## 16. Product Architecture Principle

Use deterministic logic for decisions that should be predictable.

Use AI for:

- Explanation.
- Recommendations.
- Roadmap generation.
- Natural-language feedback.
- Evidence interpretation.

Do not use an LLM as the only source of truth for skill scoring.

Core principle:

```text
Structured skill data
        +
Deterministic scoring
        +
AI reasoning/explanation
        =
Reliable SkillGraph experience
```

---

## 17. Cost-Control Rules

The project must be **as cost-effective and low-cost as reasonably possible** while still meeting product quality and competition requirements. Cost optimization is a mandatory engineering requirement, not an afterthought.

Every agent must prefer the simplest architecture that satisfies the requirement and must not add infrastructure only for complexity or demonstration value.

### Cost-aware decision framework

Before proposing a new AWS service, the agent must consider:
1. Is the service required for the product?
2. Is there a lower-cost AWS alternative?
3. Can an existing service already in the architecture satisfy the requirement?
4. Does the service introduce an always-on or fixed cost?
5. Can the feature be deferred without blocking the MVP?

### Services to avoid (unless documented requirement)

- EKS
- EC2 (except container builds)
- RDS (use DynamoDB On-Demand)
- NAT Gateway (use VPC endpoints or NAT instances as temporary debugging tools only)
- ALB (use API Gateway HTTP API)
- Managed Prometheus (use CloudWatch)
- Managed Grafana (use CloudWatch)
- Always-on compute (favor Lambda)

### Preferred services

- Lambda (serverless, pay-per-invocation)
- DynamoDB On-Demand (no provisioned capacity)
- S3 (for static files and artifacts)
- CloudFront (CDN for S3)
- API Gateway HTTP API (cheaper than REST API)
- Cognito (for authentication)
- Bedrock with controlled model/token usage (metered)
- CloudWatch (monitoring, logs, alarms)

### AWS Billing and Budget Controls

Before Phase 2 AWS deployment:

1. **Create an AWS Budget** with the following alerts:
   - Alert at **$10 spend** (estimated monthly for MVP development)
   - Alert at **$20 spend** (halfway to planning target)
   - Alert at **$25 spend** (planning target for full MVP; may be slightly exceeded but should not be routine)

2. **Enable CloudWatch billing alarms** (via SNS):
   - Email notification when any alert triggers
   - Review billings alerts weekly during development

3. **Monthly cost review target:**
   - Approximately **$25 USD/month or less** for the full application (development + validation)
   - Includes: Lambda invocations, DynamoDB storage/throughput, S3, CloudFront, Cognito, Bedrock usage, CloudWatch logs
   - Treat this as a planning target, not a hard limit; some overages are acceptable during testing

4. **Cost control practices:**
   - Use DynamoDB On-Demand pricing (no reserved capacity)
   - Delete unused test resources immediately
   - Control Bedrock model usage (log token counts, set per-request limits if available)
   - Archive CloudWatch logs to S3 after 7–14 days to control log retention costs
   - Use CloudFront aggressively to cache static assets
   - Monitor API Gateway request counts
   - Set CloudWatch log retention policies (e.g., 7 days for dev, 30 days for prod)

5. **Cost visibility:**
   - Any PR that adds an AWS service, persistent storage, or significant Bedrock usage must include a brief cost impact note
   - Document any cost-increasing changes in the commit message
   - If any service reaches $10+/month in isolation, reevaluate whether a cheaper alternative exists

Any agent proposing a service must include a cost estimate in the PR description. The review must assess cost reasonableness before merging.

## 18. Documentation Requirements

Keep documentation updated as the project evolves.

At minimum:

- `README.md` — project overview, setup, architecture, Vercel validation URL, and final AWS live URL.
- `plan.md` — this file; implementation source of truth.
- `CONTRIBUTING.md` — contribution and PR rules.
- `SECURITY.md` — security practices and reporting.
- Architecture diagrams in `docs/architecture/`.
- ADRs for important architectural decisions.

The README should eventually document the AI-assisted development story and the role of Claude Code, GitHub Copilot, and OpenAI/Codex.

---

## 19. Definition of Done

A feature is complete only when:

- Code is implemented.
- Relevant tests exist.
- Tests pass.
- Linting passes.
- Formatting passes.
- Type checking passes where applicable.
- Security checks pass where applicable.
- No secrets are committed.
- No sensitive values are hardcoded.
- Documentation is updated if required.
- CI passes.
- The change is reviewed.
- The correct branch/PR flow is followed.
- Deployment verification passes when the change reaches an environment.

---

## 20. First Implementation Sequence

### Phase 1 — Local + Vercel
1. Repository initialization.
2. Base project structure.
3. Branch protection and GitHub environments.
4. CI foundation.
5. Codecov integration.
6. Frontend skeleton.
7. FastAPI skeleton.
8. Authentication design.
9. User profile.
10. Skill graph data model.
11. Skill-gap engine.
12. Bedrock roadmap engine.
13. Project/evidence workflow.
14. Assessments.
15. Progress dashboard.
16. Vercel deployment.
17. Vercel smoke and E2E validation.

### Phase 2 — AWS
18. Terraform foundation.
19. AWS infrastructure.
20. AWS authentication, storage, and data services.
21. AWS application deployment.
22. Production smoke tests and critical E2E tests.

### Phase 3 — Hardening + Submission
23. Security hardening.
24. Performance testing and optimization.
25. CloudWatch monitoring/logging hardening.
26. Cost review and optimization.
27. Final documentation and architecture diagrams.
28. Competition evidence and submission.

## 21. Instruction to Every Coding Agent

Before changing the repository:

1. Read `plan.md`.
2. Inspect the existing repository structure.
3. Inspect relevant code and tests before editing.
4. Follow the architecture and security rules in this plan.
5. Make the smallest sensible change.
6. Add/update tests for the change.
7. Run linting and formatting.
8. Run relevant type checks.
9. Run security checks when relevant.
10. Run the complete relevant test suite.
11. Review the final diff.
12. Verify that no sensitive files or hardcoded secrets were introduced.
13. Report exactly what was changed and what checks were executed.
14. Never create or merge a PR to the wrong target branch.
15. Never skip required tests or linting just because a change appears small.
16. Follow the three project phases and do not introduce Phase 2 AWS production infrastructure while Phase 1 validation criteria are unmet, unless explicitly instructed.
17. Prefer the lowest-cost architecture that satisfies the requirement.
18. Before adding a new dependency or AWS service, check whether an existing dependency/service can satisfy the requirement with lower cost and complexity.
19. Treat AWS cost as a first-class acceptance criterion for infrastructure changes and include cost impact in the PR when relevant.
20. Never trade away required security or testing solely to reduce cost.

**The agent must treat this file as the project operating contract.**

---

## 15. Claude Code `grill-me` Skill — Mandatory Planning Gate

The repository includes a project-local `grill-me` Claude Code skill and its `grilling` prerequisite under `.claude/skills/`.

Purpose: use the skill to stress-test important plans and designs before implementation. The skill walks the decision tree, surfaces hidden assumptions and dependencies, and requires shared understanding before work proceeds.

### Files

```text
.claude/
└── skills/
    ├── grill-me/
    │   └── SKILL.md
    └── grilling/
        └── SKILL.md
```

### How we use it

Use `/grill-me` before:
- Starting a major project phase.
- Making a significant architecture decision.
- Changing the AWS architecture or deployment strategy.
- Introducing a new major dependency or service.
- Expanding MVP scope.
- Making a security, data-model, or CI/CD decision with significant impact.

The skill is user-invoked and should not start automatically. The agent must use repository facts and available tooling to answer factual questions where possible instead of asking the user for information that can be discovered from the codebase or environment.

The agent must not implement the grilled plan until the user confirms that a shared understanding has been reached.

### SkillGraph-specific grilling rule

Before Phase 1 begins, run a `grill-me` session against the current `plan.md` and resolve the major open decisions. Repeat at the Phase 1 → Phase 2 boundary and whenever the architecture or scope changes materially.

The purpose is not to slow development. It is to reduce rework, catch hidden assumptions early, and make the final implementation deliberate.
