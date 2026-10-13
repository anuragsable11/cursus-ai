from job_matcher import match_job
from profile_analyzer import canonical_skill


# Core skills for the AI Engineer career path.
AI_ENGINEER_SKILLS = [
    "Python",
    "SQL",
    "REST API",
    "Machine Learning",
    "Deep Learning",
    "PyTorch",
    "LLM",
    "Generative AI",
    "RAG",
    "LangChain",
    "Docker",
]


def _plan(priority: int, level: str, topics: list[str], project: str) -> dict:
    return {
        "priority": priority,
        "level": level,
        "topics": topics,
        "project": project,
    }


def _cloud_plan(priority: int, provider: str) -> dict:
    return _plan(
        priority,
        "Deployment",
        [
            f"{provider} accounts, regions, IAM and least-privilege access",
            f"Compute and storage services on {provider}",
            f"Deploying a containerized API to {provider} and managing cost",
        ],
        f"Deploy your containerized FastAPI AI service to {provider}.",
    )


# Practical learning activities for each skill. Priorities order the
# roadmap from foundations to deployment.
SKILL_LEARNING_PLANS = {
    "Python": _plan(1, "Foundation", [
        "Functions, classes, modules, and exceptions",
        "File handling, JSON, and virtual environments",
        "Type hints and writing reusable code",
    ], "Build a command-line document processing tool."),
    "Git": _plan(2, "Foundation", [
        "Commits, branches, merges, and resolving conflicts",
        "Pull requests and code review on GitHub",
        "Writing clear commit messages and a useful README",
    ], "Publish one of your projects on GitHub with a clean history and README."),
    "SQL": _plan(3, "Foundation", [
        "SELECT, filtering, sorting, and aggregation",
        "JOINs, relationships, and database design",
        "Parameterized queries and transactions",
    ], "Store and retrieve AI application conversations in a database."),
    "Linux": _plan(4, "Foundation", [
        "Shell navigation, permissions, and processes",
        "Environment variables, pipes, and shell scripts",
        "SSH and working on remote servers",
    ], "Write a shell script that sets up and runs your Python project."),
    "REST API": _plan(5, "Backend", [
        "HTTP methods, status codes, and JSON",
        "Request validation, pagination, and error responses",
        "API documentation and testing",
    ], "Design and document a small REST API for a notes application."),
    "FastAPI": _plan(6, "Backend", [
        "Path operations, Pydantic models, and validation",
        "Async endpoints and dependency injection",
        "Automatic OpenAPI docs and testing with TestClient",
    ], "Build a FastAPI endpoint that accepts a question and returns a structured response."),
    "NumPy": _plan(7, "Data", [
        "Arrays, shapes, broadcasting, and vectorized math",
        "Indexing, slicing, and aggregation",
        "Linear algebra basics used in ML",
    ], "Implement cosine similarity and a tiny nearest-neighbour search with NumPy."),
    "Pandas": _plan(8, "Data", [
        "DataFrames, selection, and filtering",
        "Cleaning missing data and grouping",
        "Joining datasets and exporting results",
    ], "Clean and analyze a public dataset and summarize the findings."),
    "Machine Learning": _plan(9, "AI Foundations", [
        "Features, labels, training, and test datasets",
        "Loss functions, overfitting, and evaluation metrics",
        "Build and evaluate a simple classification model",
    ], "Train and evaluate a small text classification model."),
    "Scikit-learn": _plan(10, "AI Foundations", [
        "Pipelines, preprocessing, and model selection",
        "Cross-validation and hyperparameter search",
        "Classification and regression metrics",
    ], "Build a scikit-learn pipeline that classifies support tickets."),
    "Deep Learning": _plan(11, "AI Foundations", [
        "Neural networks and activation functions",
        "Forward propagation and backpropagation",
        "Training loops, optimizers, and loss curves",
    ], "Train a small neural network using PyTorch."),
    "PyTorch": _plan(12, "AI Engineering", [
        "Tensors, autograd, and gradient descent",
        "Dataset and DataLoader workflows",
        "Model training, evaluation, and saving",
    ], "Train and save a small PyTorch model."),
    "TensorFlow": _plan(13, "AI Engineering", [
        "Tensors and the Keras model API",
        "Training with callbacks and monitoring",
        "Saving and serving models",
    ], "Rebuild a small PyTorch model in Keras and compare the results."),
    "NLP": _plan(14, "AI Engineering", [
        "Tokenization, text normalization, and vocabularies",
        "Classic text features versus learned embeddings",
        "Text classification and named entity recognition",
    ], "Build a sentiment classifier and compare two text representations."),
    "LLM": _plan(15, "Generative AI", [
        "Tokens, context windows, and transformer basics",
        "Inference parameters and structured prompting",
        "Model limitations, hallucinations, and evaluation",
    ], "Build an application that answers questions using an LLM."),
    "Prompt Engineering": _plan(16, "Generative AI", [
        "System prompts, few-shot examples, and output formats",
        "Prompt injection risks and input handling",
        "Measuring prompt quality with test cases",
    ], "Create a prompt test suite that scores outputs for a summarization task."),
    "Generative AI": _plan(17, "Generative AI", [
        "Prompt design and structured outputs",
        "Using model APIs and open-source models",
        "Evaluation, safety, and handling model failures",
    ], "Build a document summarizer with structured output."),
    "Hugging Face": _plan(18, "Generative AI", [
        "Finding and loading models from the Hub",
        "Pipelines and tokenizers in Transformers",
        "Datasets library and model cards",
    ], "Run an open-source model locally and wrap it in a small API."),
    "Embeddings": _plan(19, "Advanced AI Engineering", [
        "What embeddings represent and how similarity works",
        "Choosing an embedding model and dimensions",
        "Semantic search and clustering",
    ], "Build semantic search over a folder of text files."),
    "Vector Database": _plan(20, "Advanced AI Engineering", [
        "Indexing, metadata filtering, and similarity metrics",
        "Approximate nearest-neighbour search trade-offs",
        "Running FAISS, Chroma, or pgvector locally",
    ], "Store document embeddings in a vector database and query them."),
    "RAG": _plan(21, "Advanced AI Engineering", [
        "Document loading, chunking, and embeddings",
        "Vector search and retrieval strategies",
        "Grounded generation and retrieval evaluation",
    ], "Build a RAG chatbot that answers questions from uploaded documents."),
    "LangChain": _plan(22, "AI Application Development", [
        "Model integrations and prompt templates",
        "Document loaders, retrievers, and chains",
        "Tracing and evaluating application workflows",
    ], "Build a document question-answering pipeline."),
    "LlamaIndex": _plan(23, "AI Application Development", [
        "Indexes, nodes, and query engines",
        "Data connectors and ingestion pipelines",
        "Evaluating retrieval quality",
    ], "Rebuild your RAG pipeline with LlamaIndex and compare answer quality."),
    "Fine-tuning": _plan(24, "Advanced AI Engineering", [
        "When to fine-tune versus prompt or retrieve",
        "Preparing instruction datasets",
        "Parameter-efficient fine-tuning with LoRA",
    ], "Fine-tune a small open model on a narrow task and evaluate it."),
    "Docker": _plan(25, "Deployment", [
        "Images, containers, and Dockerfiles",
        "Environment variables and dependency management",
        "Running an API with reproducible configuration",
    ], "Containerize your FastAPI AI application."),
    "CI/CD": _plan(26, "Deployment", [
        "Automated tests and linting on every push",
        "Building and publishing container images",
        "Deployment pipelines with GitHub Actions",
    ], "Add a GitHub Actions workflow that tests and builds your AI service."),
    "Kubernetes": _plan(27, "Deployment", [
        "Pods, deployments, and services",
        "Config maps, secrets, and resource limits",
        "Scaling and health checks",
    ], "Deploy your containerized API to a local Kubernetes cluster."),
    "AWS": _cloud_plan(28, "AWS"),
    "GCP": _cloud_plan(29, "GCP"),
    "Azure": _cloud_plan(30, "Azure"),
    "MLflow": _plan(31, "MLOps", [
        "Experiment tracking and metrics",
        "Model registry and versioning",
        "Reproducible runs",
    ], "Track several training runs with MLflow and register the best model."),
}

DEFAULT_PLAN = {
    "priority": 99,
    "level": "Skill Development",
    "topics": [
        "Learn the fundamentals and key terminology",
        "Complete a guided hands-on exercise",
        "Apply the skill in a small practical project",
    ],
    "project": "Build a small project demonstrating this skill.",
}


def analyze_skill_gaps(
    resume_skills: list[str],
    job_description: str,
    target_weeks: int = 4,
) -> dict:
    """
    Compare resume skills with a job description and the
    core AI Engineer skill path, then create a learning roadmap.
    """

    if not 1 <= target_weeks <= 12:
        raise ValueError("target_weeks must be between 1 and 12.")

    # Reuse the existing, transparent job-matching logic.
    job_match = match_job(
        resume_skills=resume_skills,
        job_description=job_description,
    )

    resume_lookup = {
        canonical_skill(skill).casefold()
        for skill in resume_skills
        if skill.strip()
    }

    # Skills expected on the AI Engineer learning path.
    career_gaps = [
        skill
        for skill in AI_ENGINEER_SKILLS
        if skill.casefold() not in resume_lookup
    ]

    # Combine job-specific gaps and career-path gaps without duplicates.
    all_gaps = {}
    for skill in job_match["missing_skills"] + career_gaps:
        all_gaps.setdefault(skill.casefold(), skill)

    prioritized_gaps = sorted(
        all_gaps.values(),
        key=lambda skill: (
            SKILL_LEARNING_PLANS.get(
                skill, DEFAULT_PLAN
            )["priority"],
            skill.casefold(),
        ),
    )

    # Assign skills to weeks in priority order.
    weekly_roadmap = []

    for week in range(1, target_weeks + 1):
        weekly_skills = prioritized_gaps[
            (week - 1) * len(prioritized_gaps) // target_weeks:
            week * len(prioritized_gaps) // target_weeks
        ]

        # Use an explicit empty week if there are fewer gaps than weeks.
        activities = []

        for skill in weekly_skills:
            plan = SKILL_LEARNING_PLANS.get(skill, DEFAULT_PLAN)
            activities.append({
                "skill": skill,
                "priority": plan["priority"],
                "level": plan["level"],
                "topics": plan["topics"],
                "project": plan["project"],
            })

        weekly_roadmap.append({
            "week": week,
            "title": (
                f"Week {week}: " +
                (
                    ", ".join(weekly_skills)
                    if weekly_skills
                    else "Review and practice"
                )
            ),
            "skills": weekly_skills,
            "activities": activities,
            "deliverable": (
                "Complete the listed exercises and projects."
                if activities
                else "Review previous work and strengthen weak areas."
            ),
        })

    return {
        "career_path": "AI Engineer — GenAI, LLMs, RAG and AI applications",
        "match_score": job_match["match_score"],
        "matched_job_skills": job_match["matched_skills"],
        "job_specific_gaps": job_match["missing_skills"],
        "career_path_gaps": career_gaps,
        "prioritized_gaps": prioritized_gaps,
        "target_weeks": target_weeks,
        "weekly_roadmap": weekly_roadmap,
        "analysis_method": "rule_based_skill_gap_v2",
        "disclaimer": (
            "This is a rule-based learning recommendation, not an "
            "AI-generated assessment or a guarantee of job readiness. "
            "The detected skill vocabulary is limited."
        ),
    }
