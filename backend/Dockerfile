FROM python:3.11-slim

ENV APP_HOME=/usr/src/app
WORKDIR $APP_HOME
    
COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --without dev --no-cache
    
RUN apt update && apt upgrade -y && apt install ca-certificates && update-ca-certificates

COPY . .

EXPOSE 8080

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
