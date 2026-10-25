FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose UDP telemetry listener (20777) and WebSocket broadcaster (8000)
EXPOSE 20777/udp
EXPOSE 8000/tcp

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
