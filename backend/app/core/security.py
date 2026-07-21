import hashlib
import hmac
import json
from urllib.parse import unquote

from app.core.config import settings


def verify_telegram_init_data(init_data: str) -> dict | None:
    """Verify Telegram WebApp initData and return user dict or None."""
    try:
        parsed = dict(pair.split("=", 1) for pair in init_data.split("&"))
        received_hash = parsed.pop("hash", None)
        if not received_hash:
            return None

        data_check_string = "\n".join(
            f"{k}={unquote(v)}" for k, v in sorted(parsed.items())
        )

        secret_key = hmac.new(b"WebAppData", settings.bot_token.encode(), hashlib.sha256).digest()
        expected_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if not hmac.compare_digest(expected_hash, received_hash):
            return None

        user_str = unquote(parsed.get("user", "{}"))
        return json.loads(user_str)
    except Exception:
        return None
