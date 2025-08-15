FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# System deps for WeasyPrint (PDF)
# RUN apt-get update -y && apt-get install -y --no-install-recommends \
#     build-essential libffi-dev libcairo2 pango1.0-tools \
#     libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 \
#     shared-mime-info fonts-liberation curl ca-certificates && \
#     rm -rf /var/lib/apt/lists/*

WORKDIR /app

# דרישות פייתון (אם יש לך requirements.txt)
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

# קוד האפליקציה
COPY ./app /app/app

ENV PORT=8000 LOG_LEVEL=INFO
EXPOSE 8000

CMD ["gunicorn","-k","uvicorn.workers.UvicornWorker","app.main:app","--bind","0.0.0.0:8000","--workers","2","--timeout","120"]
