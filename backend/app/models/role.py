"""Skill-graph domain model + seed data (plan.md section 20 item 10).

DRAFT seed data for local Phase 1 development only. IDs, names, and
learning-resource placeholders here are copied field-for-field from
frontend/lib/mock-data.ts so the frontend and backend never need a
translation layer. Per plan.md's MVP learning-resources rule and the
mock-data.ts header comment, these are DRAFT placeholders and must be
reviewed/approved by the project owner before any real content is shipped.

Exactly three curated roles are supported for the MVP (plan.md section 2,
goal 11): Cloud Engineer, DevOps Engineer, Python Developer.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class LearningResourceModel:
    skill_id: str
    video_title: str
    youtube_url: str
    curated_by: str
    note: str | None = None


@dataclass(frozen=True)
class SkillModel:
    id: str
    name: str
    category: str
    description: str
    importance: str
    difficulty: str
    prerequisites: tuple[str, ...]
    learning_resource: LearningResourceModel


@dataclass(frozen=True)
class SuggestedProjectModel:
    id: str
    title: str
    description: str
    related_skill_ids: tuple[str, ...]


@dataclass(frozen=True)
class RoleModel:
    id: str
    name: str
    description: str
    skills: tuple[SkillModel, ...]
    suggested_projects: tuple[SuggestedProjectModel, ...]


_CLOUD_ENGINEER = RoleModel(
    id="cloud-engineer",
    name="Cloud Engineer",
    description="Designs, builds, and operates cloud infrastructure and services.",
    skills=(
        SkillModel(
            id="ce-networking-fundamentals",
            name="Cloud Networking Fundamentals",
            category="Networking",
            description="VPCs, subnets, routing, security groups.",
            importance="core",
            difficulty="beginner",
            prerequisites=(),
            learning_resource=LearningResourceModel(
                skill_id="ce-networking-fundamentals",
                video_title="DRAFT: AWS Networking Fundamentals",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_1",
                note="Placeholder — replace with owner-approved resource.",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="ce-iam",
            name="Identity & Access Management",
            category="Security",
            description="IAM roles, policies, least-privilege access.",
            importance="core",
            difficulty="intermediate",
            prerequisites=("ce-networking-fundamentals",),
            learning_resource=LearningResourceModel(
                skill_id="ce-iam",
                video_title="DRAFT: IAM Deep Dive",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_2",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="ce-compute",
            name="Compute Services",
            category="Compute",
            description="Lambda, EC2 basics, serverless vs. always-on trade-offs.",
            importance="core",
            difficulty="intermediate",
            prerequisites=("ce-networking-fundamentals",),
            learning_resource=LearningResourceModel(
                skill_id="ce-compute",
                video_title="DRAFT: Serverless Compute Basics",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_3",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="ce-storage",
            name="Storage & Databases",
            category="Storage",
            description="S3, DynamoDB, storage classes and data lifecycle.",
            importance="important",
            difficulty="intermediate",
            prerequisites=(),
            learning_resource=LearningResourceModel(
                skill_id="ce-storage",
                video_title="DRAFT: Cloud Storage Options Explained",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_4",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="ce-iac",
            name="Infrastructure as Code",
            category="DevOps",
            description="Terraform fundamentals for reproducible infrastructure.",
            importance="important",
            difficulty="intermediate",
            prerequisites=("ce-compute",),
            learning_resource=LearningResourceModel(
                skill_id="ce-iac",
                video_title="DRAFT: Terraform Crash Course",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_5",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="ce-linux-fundamentals",
            name="Linux Fundamentals",
            category="Operating Systems",
            description="Shell basics, file systems, permissions, and process management on the Linux hosts most cloud workloads run on.",
            importance="core",
            difficulty="beginner",
            prerequisites=(),
            learning_resource=LearningResourceModel(
                skill_id="ce-linux-fundamentals",
                video_title="DRAFT: Linux Fundamentals for Cloud Engineers",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_15",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="ce-cost-optimization",
            name="Cost Optimization & Billing",
            category="FinOps",
            description="Reading cost/usage reports, rightsizing resources, and applying budgets and alerts.",
            importance="important",
            difficulty="intermediate",
            prerequisites=("ce-compute", "ce-storage"),
            learning_resource=LearningResourceModel(
                skill_id="ce-cost-optimization",
                video_title="DRAFT: AWS Cost Optimization Basics",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_16",
                curated_by="draft-pending-review",
            ),
        ),
    ),
    suggested_projects=(
        SuggestedProjectModel(
            id="ce-project-vpc",
            title="Design a multi-tier VPC",
            description="Build a VPC with public/private subnets and a NAT-free architecture.",
            related_skill_ids=("ce-networking-fundamentals", "ce-iam"),
        ),
        SuggestedProjectModel(
            id="ce-project-serverless-api",
            title="Deploy a serverless API",
            description="Ship a Lambda + API Gateway + DynamoDB service with Terraform.",
            related_skill_ids=("ce-compute", "ce-storage", "ce-iac"),
        ),
    ),
)

_DEVOPS_ENGINEER = RoleModel(
    id="devops-engineer",
    name="DevOps Engineer",
    description="Builds CI/CD pipelines and operational tooling for reliable delivery.",
    skills=(
        SkillModel(
            id="de-cicd",
            name="CI/CD Pipelines",
            category="DevOps",
            description="Automated build, test, and deployment pipelines.",
            importance="core",
            difficulty="beginner",
            prerequisites=(),
            learning_resource=LearningResourceModel(
                skill_id="de-cicd",
                video_title="DRAFT: CI/CD with GitHub Actions",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_6",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="de-containers",
            name="Containers",
            category="DevOps",
            description="Docker fundamentals, image building, local orchestration.",
            importance="core",
            difficulty="intermediate",
            prerequisites=("de-cicd",),
            learning_resource=LearningResourceModel(
                skill_id="de-containers",
                video_title="DRAFT: Docker for Beginners",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_7",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="de-monitoring",
            name="Monitoring & Observability",
            category="Operations",
            description="Logs, metrics, alarms, and incident response basics.",
            importance="core",
            difficulty="intermediate",
            prerequisites=(),
            learning_resource=LearningResourceModel(
                skill_id="de-monitoring",
                video_title="DRAFT: CloudWatch Monitoring Basics",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_8",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="de-iac",
            name="Infrastructure as Code",
            category="DevOps",
            description="Terraform fundamentals for reproducible infrastructure.",
            importance="important",
            difficulty="intermediate",
            prerequisites=(),
            learning_resource=LearningResourceModel(
                skill_id="de-iac",
                video_title="DRAFT: Terraform Crash Course",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_5",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="de-security-scanning",
            name="Security Scanning in CI",
            category="Security",
            description="Dependency and secret scanning integrated into pipelines.",
            importance="important",
            difficulty="intermediate",
            prerequisites=("de-cicd",),
            learning_resource=LearningResourceModel(
                skill_id="de-security-scanning",
                video_title="DRAFT: Shift-Left Security Scanning",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_9",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="de-linux-scripting",
            name="Linux & Shell Scripting",
            category="Operations",
            description="Automating operational tasks with bash and core Linux command-line tools.",
            importance="core",
            difficulty="beginner",
            prerequisites=(),
            learning_resource=LearningResourceModel(
                skill_id="de-linux-scripting",
                video_title="DRAFT: Bash Scripting for DevOps",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_17",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="de-kubernetes",
            name="Container Orchestration (Kubernetes)",
            category="DevOps",
            description="Deployments, services, and scaling workloads with Kubernetes.",
            importance="important",
            difficulty="advanced",
            prerequisites=("de-containers",),
            learning_resource=LearningResourceModel(
                skill_id="de-kubernetes",
                video_title="DRAFT: Kubernetes Fundamentals",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_18",
                curated_by="draft-pending-review",
            ),
        ),
    ),
    suggested_projects=(
        SuggestedProjectModel(
            id="de-project-pipeline",
            title="Build a full CI/CD pipeline",
            description="Lint, test, scan, and deploy a sample app on every PR.",
            related_skill_ids=("de-cicd", "de-security-scanning"),
        ),
        SuggestedProjectModel(
            id="de-project-observability",
            title="Add observability to a service",
            description="Instrument a service with logs, metrics, and alarms.",
            related_skill_ids=("de-monitoring",),
        ),
    ),
)

_PYTHON_DEVELOPER = RoleModel(
    id="python-developer",
    name="Python Developer",
    description="Builds backend services and applications using Python.",
    skills=(
        SkillModel(
            id="pd-core-python",
            name="Core Python",
            category="Language",
            description="Data structures, functions, OOP fundamentals.",
            importance="core",
            difficulty="beginner",
            prerequisites=(),
            learning_resource=LearningResourceModel(
                skill_id="pd-core-python",
                video_title="DRAFT: Python Fundamentals",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_10",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="pd-testing",
            name="Testing with pytest",
            category="Quality",
            description="Unit tests, fixtures, mocking.",
            importance="core",
            difficulty="intermediate",
            prerequisites=("pd-core-python",),
            learning_resource=LearningResourceModel(
                skill_id="pd-testing",
                video_title="DRAFT: pytest in Practice",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_11",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="pd-fastapi",
            name="API Development with FastAPI",
            category="Backend",
            description="Building REST APIs with FastAPI and Pydantic.",
            importance="core",
            difficulty="intermediate",
            prerequisites=("pd-core-python",),
            learning_resource=LearningResourceModel(
                skill_id="pd-fastapi",
                video_title="DRAFT: FastAPI Crash Course",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_12",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="pd-databases",
            name="Working with Databases",
            category="Backend",
            description="Data modeling and access patterns, including NoSQL basics.",
            importance="important",
            difficulty="intermediate",
            prerequisites=("pd-core-python",),
            learning_resource=LearningResourceModel(
                skill_id="pd-databases",
                video_title="DRAFT: NoSQL Data Modeling Basics",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_13",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="pd-packaging",
            name="Dependency & Packaging",
            category="Tooling",
            description="Virtual environments, dependency management, project layout.",
            importance="nice-to-have",
            difficulty="beginner",
            prerequisites=("pd-core-python",),
            learning_resource=LearningResourceModel(
                skill_id="pd-packaging",
                video_title="DRAFT: Python Packaging Basics",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_14",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="pd-git",
            name="Version Control with Git",
            category="Tooling",
            description="Branching, merging, and collaborating on code through pull requests.",
            importance="core",
            difficulty="beginner",
            prerequisites=(),
            learning_resource=LearningResourceModel(
                skill_id="pd-git",
                video_title="DRAFT: Git & GitHub Fundamentals",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_19",
                curated_by="draft-pending-review",
            ),
        ),
        SkillModel(
            id="pd-async",
            name="Asynchronous Programming",
            category="Language",
            description="async/await, event loops, and concurrent I/O for scalable services.",
            importance="important",
            difficulty="advanced",
            prerequisites=("pd-core-python",),
            learning_resource=LearningResourceModel(
                skill_id="pd-async",
                video_title="DRAFT: Async Python Explained",
                youtube_url="https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_20",
                curated_by="draft-pending-review",
            ),
        ),
    ),
    suggested_projects=(
        SuggestedProjectModel(
            id="pd-project-api",
            title="Ship a small FastAPI service",
            description="Build and test a REST API with at least two resources.",
            related_skill_ids=("pd-fastapi", "pd-testing"),
        ),
        SuggestedProjectModel(
            id="pd-project-cli",
            title="Build a CLI tool",
            description="Practice core Python and packaging by shipping a CLI utility.",
            related_skill_ids=("pd-core-python", "pd-packaging"),
        ),
    ),
)

SEED_ROLES: tuple[RoleModel, ...] = (_CLOUD_ENGINEER, _DEVOPS_ENGINEER, _PYTHON_DEVELOPER)
