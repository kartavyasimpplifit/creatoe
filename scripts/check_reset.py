from datetime import datetime, timezone, timedelta
now = datetime.now(timezone.utc)
pacific = now - timedelta(hours=7)
next_midnight = pacific.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
reset_utc = next_midnight + timedelta(hours=7)
wait = (reset_utc - now).total_seconds()
print(f"UTC now: {now.strftime('%Y-%m-%d %H:%M')}")
print(f"Quota resets at: {reset_utc.strftime('%Y-%m-%d %H:%M UTC')}")
print(f"Wait: {wait/3600:.1f} hours ({wait/60:.0f} minutes)")
