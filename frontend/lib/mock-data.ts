/**
 * DRAFT mock/seed data for local Phase 1 development only.
 * Skill graphs and learning resources here are placeholders and must be
 * reviewed and approved by the project owner before any real seeding
 * (plan.md MVP learning resources / Q4 content-ownership rule).
 */
import type { Role, RoleProgress } from './types';

export const ROLES: Role[] = [
  {
    id: 'cloud-engineer',
    name: 'Cloud Engineer',
    description: 'Designs, builds, and operates cloud infrastructure and services.',
    skills: [
      {
        id: 'ce-networking-fundamentals',
        name: 'Cloud Networking Fundamentals',
        category: 'Networking',
        description: 'VPCs, subnets, routing, security groups.',
        importance: 'core',
        difficulty: 'beginner',
        prerequisites: [],
        learningResource: {
          skillId: 'ce-networking-fundamentals',
          videoTitle: 'DRAFT: AWS Networking Fundamentals',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_1',
          note: 'Placeholder — replace with owner-approved resource.',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'ce-iam',
        name: 'Identity & Access Management',
        category: 'Security',
        description: 'IAM roles, policies, least-privilege access.',
        importance: 'core',
        difficulty: 'intermediate',
        prerequisites: ['ce-networking-fundamentals'],
        learningResource: {
          skillId: 'ce-iam',
          videoTitle: 'DRAFT: IAM Deep Dive',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_2',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'ce-compute',
        name: 'Compute Services',
        category: 'Compute',
        description: 'Lambda, EC2 basics, serverless vs. always-on trade-offs.',
        importance: 'core',
        difficulty: 'intermediate',
        prerequisites: ['ce-networking-fundamentals'],
        learningResource: {
          skillId: 'ce-compute',
          videoTitle: 'DRAFT: Serverless Compute Basics',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_3',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'ce-storage',
        name: 'Storage & Databases',
        category: 'Storage',
        description: 'S3, DynamoDB, storage classes and data lifecycle.',
        importance: 'important',
        difficulty: 'intermediate',
        prerequisites: [],
        learningResource: {
          skillId: 'ce-storage',
          videoTitle: 'DRAFT: Cloud Storage Options Explained',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_4',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'ce-iac',
        name: 'Infrastructure as Code',
        category: 'DevOps',
        description: 'Terraform fundamentals for reproducible infrastructure.',
        importance: 'important',
        difficulty: 'intermediate',
        prerequisites: ['ce-compute'],
        learningResource: {
          skillId: 'ce-iac',
          videoTitle: 'DRAFT: Terraform Crash Course',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_5',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'ce-linux-fundamentals',
        name: 'Linux Fundamentals',
        category: 'Operating Systems',
        description: 'Shell basics, file systems, permissions, and process management on the Linux hosts most cloud workloads run on.',
        importance: 'core',
        difficulty: 'beginner',
        prerequisites: [],
        learningResource: {
          skillId: 'ce-linux-fundamentals',
          videoTitle: 'DRAFT: Linux Fundamentals for Cloud Engineers',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_15',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'ce-cost-optimization',
        name: 'Cost Optimization & Billing',
        category: 'FinOps',
        description: 'Reading cost/usage reports, rightsizing resources, and applying budgets and alerts.',
        importance: 'important',
        difficulty: 'intermediate',
        prerequisites: ['ce-compute', 'ce-storage'],
        learningResource: {
          skillId: 'ce-cost-optimization',
          videoTitle: 'DRAFT: AWS Cost Optimization Basics',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_16',
          curatedBy: 'draft-pending-review',
        },
      },
    ],
    suggestedProjects: [
      {
        id: 'ce-project-vpc',
        title: 'Design a multi-tier VPC',
        description: 'Build a VPC with public/private subnets and a NAT-free architecture.',
        relatedSkillIds: ['ce-networking-fundamentals', 'ce-iam'],
      },
      {
        id: 'ce-project-serverless-api',
        title: 'Deploy a serverless API',
        description: 'Ship a Lambda + API Gateway + DynamoDB service with Terraform.',
        relatedSkillIds: ['ce-compute', 'ce-storage', 'ce-iac'],
      },
    ],
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    description: 'Builds CI/CD pipelines and operational tooling for reliable delivery.',
    skills: [
      {
        id: 'de-cicd',
        name: 'CI/CD Pipelines',
        category: 'DevOps',
        description: 'Automated build, test, and deployment pipelines.',
        importance: 'core',
        difficulty: 'beginner',
        prerequisites: [],
        learningResource: {
          skillId: 'de-cicd',
          videoTitle: 'DRAFT: CI/CD with GitHub Actions',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_6',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'de-containers',
        name: 'Containers',
        category: 'DevOps',
        description: 'Docker fundamentals, image building, local orchestration.',
        importance: 'core',
        difficulty: 'intermediate',
        prerequisites: ['de-cicd'],
        learningResource: {
          skillId: 'de-containers',
          videoTitle: 'DRAFT: Docker for Beginners',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_7',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'de-monitoring',
        name: 'Monitoring & Observability',
        category: 'Operations',
        description: 'Logs, metrics, alarms, and incident response basics.',
        importance: 'core',
        difficulty: 'intermediate',
        prerequisites: [],
        learningResource: {
          skillId: 'de-monitoring',
          videoTitle: 'DRAFT: CloudWatch Monitoring Basics',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_8',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'de-iac',
        name: 'Infrastructure as Code',
        category: 'DevOps',
        description: 'Terraform fundamentals for reproducible infrastructure.',
        importance: 'important',
        difficulty: 'intermediate',
        prerequisites: [],
        learningResource: {
          skillId: 'de-iac',
          videoTitle: 'DRAFT: Terraform Crash Course',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_5',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'de-security-scanning',
        name: 'Security Scanning in CI',
        category: 'Security',
        description: 'Dependency and secret scanning integrated into pipelines.',
        importance: 'important',
        difficulty: 'intermediate',
        prerequisites: ['de-cicd'],
        learningResource: {
          skillId: 'de-security-scanning',
          videoTitle: 'DRAFT: Shift-Left Security Scanning',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_9',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'de-linux-scripting',
        name: 'Linux & Shell Scripting',
        category: 'Operations',
        description: 'Automating operational tasks with bash and core Linux command-line tools.',
        importance: 'core',
        difficulty: 'beginner',
        prerequisites: [],
        learningResource: {
          skillId: 'de-linux-scripting',
          videoTitle: 'DRAFT: Bash Scripting for DevOps',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_17',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'de-kubernetes',
        name: 'Container Orchestration (Kubernetes)',
        category: 'DevOps',
        description: 'Deployments, services, and scaling workloads with Kubernetes.',
        importance: 'important',
        difficulty: 'advanced',
        prerequisites: ['de-containers'],
        learningResource: {
          skillId: 'de-kubernetes',
          videoTitle: 'DRAFT: Kubernetes Fundamentals',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_18',
          curatedBy: 'draft-pending-review',
        },
      },
    ],
    suggestedProjects: [
      {
        id: 'de-project-pipeline',
        title: 'Build a full CI/CD pipeline',
        description: 'Lint, test, scan, and deploy a sample app on every PR.',
        relatedSkillIds: ['de-cicd', 'de-security-scanning'],
      },
      {
        id: 'de-project-observability',
        title: 'Add observability to a service',
        description: 'Instrument a service with logs, metrics, and alarms.',
        relatedSkillIds: ['de-monitoring'],
      },
    ],
  },
  {
    id: 'python-developer',
    name: 'Python Developer',
    description: 'Builds backend services and applications using Python.',
    skills: [
      {
        id: 'pd-core-python',
        name: 'Core Python',
        category: 'Language',
        description: 'Data structures, functions, OOP fundamentals.',
        importance: 'core',
        difficulty: 'beginner',
        prerequisites: [],
        learningResource: {
          skillId: 'pd-core-python',
          videoTitle: 'DRAFT: Python Fundamentals',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_10',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'pd-testing',
        name: 'Testing with pytest',
        category: 'Quality',
        description: 'Unit tests, fixtures, mocking.',
        importance: 'core',
        difficulty: 'intermediate',
        prerequisites: ['pd-core-python'],
        learningResource: {
          skillId: 'pd-testing',
          videoTitle: 'DRAFT: pytest in Practice',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_11',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'pd-fastapi',
        name: 'API Development with FastAPI',
        category: 'Backend',
        description: 'Building REST APIs with FastAPI and Pydantic.',
        importance: 'core',
        difficulty: 'intermediate',
        prerequisites: ['pd-core-python'],
        learningResource: {
          skillId: 'pd-fastapi',
          videoTitle: 'DRAFT: FastAPI Crash Course',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_12',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'pd-databases',
        name: 'Working with Databases',
        category: 'Backend',
        description: 'Data modeling and access patterns, including NoSQL basics.',
        importance: 'important',
        difficulty: 'intermediate',
        prerequisites: ['pd-core-python'],
        learningResource: {
          skillId: 'pd-databases',
          videoTitle: 'DRAFT: NoSQL Data Modeling Basics',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_13',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'pd-packaging',
        name: 'Dependency & Packaging',
        category: 'Tooling',
        description: 'Virtual environments, dependency management, project layout.',
        importance: 'nice-to-have',
        difficulty: 'beginner',
        prerequisites: ['pd-core-python'],
        learningResource: {
          skillId: 'pd-packaging',
          videoTitle: 'DRAFT: Python Packaging Basics',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_14',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'pd-git',
        name: 'Version Control with Git',
        category: 'Tooling',
        description: 'Branching, merging, and collaborating on code through pull requests.',
        importance: 'core',
        difficulty: 'beginner',
        prerequisites: [],
        learningResource: {
          skillId: 'pd-git',
          videoTitle: 'DRAFT: Git & GitHub Fundamentals',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_19',
          curatedBy: 'draft-pending-review',
        },
      },
      {
        id: 'pd-async',
        name: 'Asynchronous Programming',
        category: 'Language',
        description: 'async/await, event loops, and concurrent I/O for scalable services.',
        importance: 'important',
        difficulty: 'advanced',
        prerequisites: ['pd-core-python'],
        learningResource: {
          skillId: 'pd-async',
          videoTitle: 'DRAFT: Async Python Explained',
          youtubeUrl: 'https://www.youtube.com/watch?v=DRAFT_PLACEHOLDER_20',
          curatedBy: 'draft-pending-review',
        },
      },
    ],
    suggestedProjects: [
      {
        id: 'pd-project-api',
        title: 'Ship a small FastAPI service',
        description: 'Build and test a REST API with at least two resources.',
        relatedSkillIds: ['pd-fastapi', 'pd-testing'],
      },
      {
        id: 'pd-project-cli',
        title: 'Build a CLI tool',
        description: 'Practice core Python and packaging by shipping a CLI utility.',
        relatedSkillIds: ['pd-core-python', 'pd-packaging'],
      },
    ],
  },
];

export function getRoleById(roleId: string): Role | undefined {
  return ROLES.find((role) => role.id === roleId);
}

/**
 * Placeholder progress generator for local UI development only.
 * Real progress is always computed deterministically by the backend
 * (plan.md MVP skill-progress model) — the frontend never computes it.
 */
export function getMockRoleProgress(roleId: string): RoleProgress {
  const role = getRoleById(roleId);
  const skills = role?.skills ?? [];

  const skillProgress = skills.map((skill, index) => {
    const selfAssessment = index % 2 === 0 ? 20 : 10;
    const objectiveQuiz = index % 3 === 0 ? 30 : 0;
    const practicalProject = index === 0 ? 30 : 0;
    const evidenceSubmitted = 0;
    const totalPercentage =
      selfAssessment + objectiveQuiz + practicalProject + evidenceSubmitted;

    return {
      skillId: skill.id,
      breakdown: {
        selfAssessment,
        objectiveQuiz,
        practicalProject,
        evidenceSubmitted,
      },
      totalPercentage,
    };
  });

  const overallPercentage = skillProgress.length
    ? Math.round(
        skillProgress.reduce((sum, sp) => sum + sp.totalPercentage, 0) /
          skillProgress.length
      )
    : 0;

  return {
    roleId,
    overallPercentage,
    skillProgress,
  };
}
