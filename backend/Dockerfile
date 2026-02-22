FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Actian VectorAI DB client
# NOTE: Place actiancortex-0.1.0b1-py3-none-any.whl in backend/ before building.
# Download from: https://github.com/hackmamba-io/actian-vectorAI-db-beta
COPY actiancortex-0.1.0b1-py3-none-any.whl .
RUN pip install --no-cache-dir actiancortex-0.1.0b1-py3-none-any.whl \
    && rm actiancortex-0.1.0b1-py3-none-any.whl

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
