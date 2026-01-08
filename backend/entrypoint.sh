#! /bin/bash
set -e

DEFAULT_MODULE_NAME=app.main

MODULE_NAME=${MODULE_NAME:-$DEFAULT_MODULE_NAME}
VARIABLE_NAME=${VARIABLE_NAME:-app}
export APP_MODULE=${APP_MODULE:-"$MODULE_NAME:$VARIABLE_NAME"}

DEFAULT_GUNICORN_CONF=./gunicorn_conf.py

export GUNICORN_CONF=${GUNICORN_CONF:-$DEFAULT_GUNICORN_CONF}
export TMP_DB_PASSWORD=$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$DB_PASSWORD")

#Let the DB start
if [ "$settings" = "dev" ] || [ "$settings" = "" ]
then
  echo "first if"
  echo "Check db connection in env $settings"
  until psql "postgresql://${DB_USER}:${TMP_DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -c '\q'; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done
elif [ "$settings" =  "prod" ]
then
  echo "Check db connection in env $settings"
  until psql "postgresql://${DB_USER}:${TMP_DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require" -c '\q'; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done
fi

# Run migrations
alembic upgrade heads


# Start Gunicorn
gunicorn -k uvicorn.workers.UvicornWorker -c "$GUNICORN_CONF" "$APP_MODULE" 
