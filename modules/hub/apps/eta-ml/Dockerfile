FROM python:3.12-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 worker
WORKDIR /app
COPY modules/hub/apps/eta-ml/requirements-runtime.txt ./requirements-runtime.txt
RUN pip install --no-cache-dir -r requirements-runtime.txt
COPY modules/hub/apps/eta-ml/src ./src
COPY modules/hub/sql ./sql
ENV PYTHONPATH=/app/src PYTHONUNBUFFERED=1 ETA_ML_SQL_DIR=/app/sql
USER worker
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
    CMD python -m eta_ml.serve --healthcheck
ENTRYPOINT ["python", "-m", "eta_ml.serve"]
