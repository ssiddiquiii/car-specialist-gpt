import os
import dns.resolver
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# ── Custom DNS servers (equivalent to Node.js dns.setServers(["8.8.8.8","1.1.1.1"]))
# Fixes MongoDB Atlas SRV resolution failures on networks with unreliable system DNS.
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "")
DB_NAME = os.getenv("DB_NAME", "car_specialist_gpt")

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        if not MONGO_URI:
            raise RuntimeError(
                "MONGO_URI is not set in .env. "
                "Add your MongoDB Atlas connection string."
            )
        _client = AsyncIOMotorClient(MONGO_URI)
    return _client


def get_db():
    return get_client()[DB_NAME]


def get_preference_collection():
    return get_db()["preference_logs"]

def get_users_collection():
    return get_db()["users"]

def get_conversations_collection():
    return get_db()["conversations"]

async def close_connection():
    global _client
    if _client:
        _client.close()
        _client = None
