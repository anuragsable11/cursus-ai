import re

from profile_analyzer import canonical_skill, extract_skills


def match_job(resume_skills: list[str], job_description: str) -> dict:
    """
    Compare detected resume skills with skills mentioned
    in a job description.

    The score measures skill coverage, not hiring probability.
    """

    if not job_description.strip():
        raise ValueError("Job description cannot be empty.")

    required_skills = extract_skills(job_description)

    # Canonicalize user-entered skills so "llms" or "Postgres" match
    # the detected vocabulary names.
    resume_lookup = {
        canonical_skill(skill).casefold(): skill
        for skill in resume_skills
        if skill.strip()
    }
    required_lookup = {skill.casefold(): skill for skill in required_skills}

    matched_skills = [
        skill
        for key, skill in required_lookup.items()
        if key in resume_lookup
    ]

    missing_skills = [
        skill
        for key, skill in required_lookup.items()
        if key not in resume_lookup
    ]

    total_required = len(required_skills)

    if total_required:
        score = round(len(matched_skills) / total_required * 100)
    else:
        score = 0

    return {
        "match_score": score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "required_skills": required_skills,
        "matched_count": len(matched_skills),
        "missing_count": len(missing_skills),
        "total_required": total_required,
        "scoring_method": "required_skill_coverage_v2",
        "message": (
            "Skill coverage calculated."
            if total_required
            else "No skills from the current detection vocabulary "
                 "were found in the job description."
        ),
    }
