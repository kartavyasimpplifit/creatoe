"""
YouTube Data API v3 client with strict quota enforcement.
"""

from googleapiclient.discovery import build
from backend.app.config import settings
from backend.app.youtube.quota_tracker import check_and_log, print_quota_summary


def get_youtube_service():
    return build("youtube", "v3", developerKey=settings.youtube_api_key)


def search_channels(query: str, max_results: int = 50, region_code: str = "IN") -> list[dict]:
    """Search for YouTube channels. Costs 100 units per call."""
    if not check_and_log("search.list"):
        return []

    yt = get_youtube_service()
    response = yt.search().list(
        q=query,
        type="channel",
        part="snippet",
        maxResults=min(max_results, 50),
        regionCode=region_code,
        relevanceLanguage="hi",
    ).execute()
    channels = []
    for item in response.get("items", []):
        channels.append({
            "channel_id": item["snippet"]["channelId"],
            "title": item["snippet"]["title"],
            "description": item["snippet"]["description"],
            "thumbnail": item["snippet"]["thumbnails"].get("high", {}).get("url", ""),
        })
    return channels


def get_channel_details(channel_ids: list[str]) -> list[dict]:
    """Get detailed stats for channels. Costs 1 unit per batch of up to 50."""
    results = []
    for i in range(0, len(channel_ids), 50):
        batch = channel_ids[i:i+50]
        if not check_and_log("channels.list"):
            break

        yt = get_youtube_service()
        response = yt.channels().list(
            part="snippet,statistics,contentDetails,brandingSettings",
            id=",".join(batch),
        ).execute()

        for item in response.get("items", []):
            stats = item.get("statistics", {})
            snippet = item.get("snippet", {})
            content = item.get("contentDetails", {})
            results.append({
                "channel_id": item["id"],
                "title": snippet.get("title", ""),
                "description": snippet.get("description", ""),
                "custom_url": snippet.get("customUrl", ""),
                "published_at": snippet.get("publishedAt", ""),
                "country": snippet.get("country", ""),
                "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                "subscriber_count": int(stats.get("subscriberCount", 0)),
                "video_count": int(stats.get("videoCount", 0)),
                "view_count": int(stats.get("viewCount", 0)),
                "uploads_playlist": content.get("relatedPlaylists", {}).get("uploads", ""),
            })
    return results


def get_playlist_videos(playlist_id: str, max_results: int = 30) -> list[str]:
    """Get video IDs from a playlist (uploads). Costs 1 unit per page."""
    video_ids = []
    yt = get_youtube_service()
    next_page = None

    while len(video_ids) < max_results:
        if not check_and_log("playlistItems.list"):
            break

        try:
            response = yt.playlistItems().list(
                part="contentDetails",
                playlistId=playlist_id,
                maxResults=min(50, max_results - len(video_ids)),
                pageToken=next_page,
            ).execute()
        except Exception:
            break

        for item in response.get("items", []):
            video_ids.append(item["contentDetails"]["videoId"])

        next_page = response.get("nextPageToken")
        if not next_page:
            break

    return video_ids


def get_video_details(video_ids: list[str]) -> list[dict]:
    """Get detailed video metadata. Costs 1 unit per batch of up to 50."""
    results = []
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i+50]
        if not check_and_log("videos.list"):
            break

        try:
            yt = get_youtube_service()
            response = yt.videos().list(
                part="snippet,statistics,contentDetails",
                id=",".join(batch),
            ).execute()
        except Exception:
            continue

        for item in response.get("items", []):
            snippet = item.get("snippet", {})
            stats = item.get("statistics", {})
            content = item.get("contentDetails", {})
            results.append({
                "video_id": item["id"],
                "channel_id": snippet.get("channelId", ""),
                "title": snippet.get("title", ""),
                "description": snippet.get("description", ""),
                "published_at": snippet.get("publishedAt", ""),
                "tags": snippet.get("tags", []),
                "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                "view_count": int(stats.get("viewCount", 0)),
                "like_count": int(stats.get("likeCount", 0)),
                "comment_count": int(stats.get("commentCount", 0)),
                "duration": content.get("duration", ""),
                "caption_available": content.get("caption", "false") == "true",
                "default_language": snippet.get("defaultLanguage", ""),
                "default_audio_language": snippet.get("defaultAudioLanguage", ""),
            })
    return results


def get_video_captions(video_id: str) -> str | None:
    """
    Try to get auto-generated captions for a video.
    Uses the timedtext endpoint (free, no quota cost for the download itself).
    The captions.list call costs 50 units, so we use a direct URL approach instead.
    """
    import httpx

    langs_to_try = ["hi", "en", "ta", "te"]
    for lang in langs_to_try:
        url = f"https://www.youtube.com/api/timedtext?v={video_id}&lang={lang}&fmt=srv3"
        try:
            resp = httpx.get(url, timeout=10, follow_redirects=True)
            if resp.status_code == 200 and len(resp.text) > 100:
                from xml.etree import ElementTree
                root = ElementTree.fromstring(resp.text)
                texts = [p.text for p in root.iter() if p.text]
                if texts:
                    return " ".join(texts)
        except Exception:
            continue

    for lang in langs_to_try:
        url = f"https://www.youtube.com/api/timedtext?v={video_id}&lang={lang}&kind=asr&fmt=srv3"
        try:
            resp = httpx.get(url, timeout=10, follow_redirects=True)
            if resp.status_code == 200 and len(resp.text) > 100:
                from xml.etree import ElementTree
                root = ElementTree.fromstring(resp.text)
                texts = [p.text for p in root.iter() if p.text]
                if texts:
                    return " ".join(texts)
        except Exception:
            continue

    return None
