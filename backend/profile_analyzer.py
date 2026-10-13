import re


# Canonical skill name -> other spellings that mean the same skill.
# Matching is case-insensitive and also accepts a trailing "s",
# so "REST APIs", "LLMs" and "Vector Databases" are all detected.
SKILL_ALIASES: dict[str, list[str]] = {
    # Languages
    "Python": [],
    "Java": [],
    "JavaScript": [],
    "TypeScript": [],
    "C++": [],
    "SQL": [],
    "HTML": [],
    "CSS": [],
    # Backend and web
    "REST API": ["RESTful API"],
    "FastAPI": [],
    "Django": [],
    "Flask": [],
    "React": ["React.js", "ReactJS"],
    "Next.js": ["NextJS"],
    "Node.js": ["NodeJS"],
    # Data stores
    "PostgreSQL": ["Postgres"],
    "SQLite": [],
    "MongoDB": [],
    "Redis": [],
    "Vector Database": [
        "Vector DB", "Vector Store", "Pinecone", "FAISS", "pgvector",
        "ChromaDB", "Weaviate", "Milvus", "Qdrant",
    ],
    # Tooling, cloud and deployment
    "Git": ["GitHub", "GitLab"],
    "Linux": [],
    "Docker": [],
    "Kubernetes": ["K8s"],
    "CI/CD": ["Continuous Integration"],
    "AWS": ["Amazon Web Services"],
    "Azure": [],
    "GCP": ["Google Cloud"],
    "MLflow": [],
    # Data science and ML
    "NumPy": [],
    "Pandas": [],
    "Scikit-learn": ["Sklearn", "Scikit learn"],
    "Machine Learning": ["ML"],
    "Deep Learning": [],
    "PyTorch": [],
    "TensorFlow": [],
    "NLP": ["Natural Language Processing"],
    # Generative AI
    "LLM": ["Large Language Model"],
    "Generative AI": ["GenAI", "Gen AI"],
    "Prompt Engineering": [],
    "Hugging Face": ["HuggingFace"],
    "Embeddings": ["Embedding"],
    "RAG": [
        "Retrieval-Augmented Generation",
        "Retrieval Augmented Generation",
    ],
    "LangChain": [],
    "LlamaIndex": [],
    "Fine-tuning": ["Fine tuning", "Finetuning", "Fine-tune"],
}

SKILLS = list(SKILL_ALIASES)


def _build_pattern(names: list[str]) -> re.Pattern:
    # Longest spellings first so "Retrieval-Augmented Generation" wins
    # over shorter overlapping alternatives.
    alternatives = "|".join(
        re.escape(name) for name in sorted(names, key=len, reverse=True)
    )
    return re.compile(
        rf"(?<!\w)(?:{alternatives})s?(?!\w)",
        flags=re.IGNORECASE,
    )


_SKILL_PATTERNS = {
    skill: _build_pattern([skill, *aliases])
    for skill, aliases in SKILL_ALIASES.items()
}

_CANONICAL_LOOKUP = {
    name.casefold(): skill
    for skill, aliases in SKILL_ALIASES.items()
    for name in (skill, *aliases)
}


def canonical_skill(name: str) -> str:
    """
    Map a user-entered skill to its canonical vocabulary name, so that
    "llms", "Postgres" or "REST APIs" compare equal to detected skills.
    Unknown skills are returned trimmed but otherwise unchanged.
    """

    cleaned = " ".join(name.split())
    key = cleaned.casefold()

    if key in _CANONICAL_LOOKUP:
        return _CANONICAL_LOOKUP[key]

    if key.endswith("s") and key[:-1] in _CANONICAL_LOOKUP:
        return _CANONICAL_LOOKUP[key[:-1]]

    return cleaned


def extract_skills(text: str) -> list[str]:
    """Find known skills using case-insensitive, boundary-aware matching."""

    return [
        skill
        for skill, pattern in _SKILL_PATTERNS.items()
        if pattern.search(text)
    ]


def extract_section(text: str, headings: list[str]) -> str:
    """Extract text between a known heading and the next section heading."""
    heading_pattern = "|".join(re.escape(h) for h in headings)

    match = re.search(
        rf"(?im)^\s*(?:{heading_pattern})\s*:?\s*$([\s\S]*?)(?=^\s*[A-Z][A-Z &/()-]{{2,}}\s*:?\s*$|\Z)",
        text,
    )

    return match.group(1).strip() if match else ""


def analyze_profile(text: str) -> dict:
    return {
        "skills": extract_skills(text),
        "experience_text": extract_section(
            text,
            ["Experience", "Work Experience", "Professional Experience"],
        ),
        "education_text": extract_section(
            text,
            ["Education", "Academic Background", "Qualifications"],
        ),
        "projects_text": extract_section(
            text,
            ["Projects", "Personal Projects", "Academic Projects"],
        ),
        "characters_analyzed": len(text),
        "analysis_method": "rule_based_v2",
    }
