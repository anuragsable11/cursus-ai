
from io import BytesIO

from fastapi import HTTPException, UploadFile
from pypdf import PdfReader


MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_PAGES = 30


async def extract_resume_text(file: UploadFile) -> dict:
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=415,
            detail="Please upload a PDF resume.",
        )

    content = await file.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Resume must be smaller than 5 MB.",
        )

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    try:
        reader = PdfReader(BytesIO(content))

        if reader.is_encrypted:
            raise HTTPException(
                status_code=400,
                detail="Password-protected PDFs are not supported.",
            )

        if len(reader.pages) > MAX_PAGES:
            raise HTTPException(
                status_code=400,
                detail="Resume PDF must have 30 pages or fewer.",
            )

        text = "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        ).strip()

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="The PDF could not be read. Please upload a valid PDF.",
        )

    if not text:
        raise HTTPException(
            status_code=422,
            detail="No selectable text found. Scanned PDFs are not supported yet.",
        )

    return {
        "filename": file.filename,
        "pages": len(reader.pages),
        "characters_extracted": len(text),
        "extracted_text": text,
        "status": "text_extracted",
    }
