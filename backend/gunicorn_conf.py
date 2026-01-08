import multiprocessing
import os

workers_per_core_str = os.getenv("WORKERS_PER_CORE", "1")
web_concurrency_str = os.getenv("WEB_CONCURRENCY", None)
host = os.getenv("HOST", "0.0.0.0")
port = os.getenv("PORT", "8080")
bind_env = os.getenv("BIND", None)
use_loglevel = os.getenv("LOG_LEVEL", "info")
use_bind = bind_env or f"{host}:{port}"
cores = multiprocessing.cpu_count()
workers_per_core = float(workers_per_core_str)
default_web_concurrency = workers_per_core * cores
if web_concurrency_str:
	web_concurrency = int(web_concurrency_str)
	assert web_concurrency > 0
else:
	web_concurrency = max(int(default_web_concurrency), 2)

# Gunicorn config variables
loglevel = use_loglevel
workers = 2
bind = use_bind
errorlog = "-"
# keyfile = "key.pem"
# certfile = "cert.pem"


# def on_starting(server):
#     print("Start setup with dac-service")
#     asyncio.run(run_autoreg())
#     print("Success setup with dac-service")


# async def run_autoreg():
#     await asyncio.sleep(5)  # for app starting
#     await Autoreg(app=app, settings=settings).autoreg()
