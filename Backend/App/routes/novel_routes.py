from flask import Blueprint, jsonify

novel_bp = Blueprint("novel", __name__)

novel_list = [
    {
        "id": 1,
        "name": "全职猎人",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10031.webp",
        "latestEpisode": 10,
        "latestUpdate": "2023-10-03",
        "subteam": "XX字幕组",
    },
    {
        "id": 2,
        "name": "进击的巨人",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10032.webp",
        "latestEpisode": 5,
        "latestUpdate": "2023-09-28",
        "subteam": "YY字幕组",
    },
    {
        "id": 3,
        "name": "约定的梦幻岛",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10033.webp",
        "latestEpisode": 6,
        "latestUpdate": "2023-10-02",
        "subteam": "ZZ字幕组",
    },
    {
        "id": 4,
        "name": "悬崖之上",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10034.webp",
        "latestEpisode": 7,
        "latestUpdate": "2023-10-01",
        "subteam": "AA字幕组",
    },
    {
        "id": 5,
        "name": "命运石之门",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10035.webp",
        "latestEpisode": 3,
        "latestUpdate": "2023-09-29",
        "subteam": "BB字幕组",
    },
    {
        "id": 6,
        "name": "鬼灭之刃",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10036.webp",
        "latestEpisode": 16,
        "latestUpdate": "2023-10-03",
        "subteam": "CC字幕组",
    },
    {
        "id": 7,
        "name": "刺客伍六七",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10037.webp",
        "latestEpisode": 8,
        "latestUpdate": "2023-09-30",
        "subteam": "DD字幕组",
    },
    {
        "id": 8,
        "name": "海贼王",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10038.webp",
        "latestEpisode": 987,
        "latestUpdate": "2023-10-02",
        "subteam": "EE字幕组",
    },
    {
        "id": 9,
        "name": "镇魂街",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10039.webp",
        "latestEpisode": 24,
        "latestUpdate": "2023-10-01",
        "subteam": "FF字幕组",
    },
    {
        "id": 10,
        "name": "致不灭的你",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10040.webp",
        "latestEpisode": 4,
        "latestUpdate": "2023-09-28",
        "subteam": "GG字幕组",
    },
    {
        "id": 11,
        "name": "无职转生",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10041.webp",
        "latestEpisode": 9,
        "latestUpdate": "2023-10-03",
        "subteam": "HH字幕组",
    },
    {
        "id": 12,
        "name": "秦时明月",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10042.webp",
        "latestEpisode": 30,
        "latestUpdate": "2023-09-29",
        "subteam": "II字幕组",
    },
    {
        "id": 13,
        "name": "异世界魔王与召唤少女的奴隶魔术",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10043.webp",
        "latestEpisode": 6,
        "latestUpdate": "2023-10-02",
        "subteam": "JJ字幕组",
    },
    {
        "id": 14,
        "name": "灵笼",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10044.webp",
        "latestEpisode": 5,
        "latestUpdate": "2023-09-28",
        "subteam": "KK字幕组",
    },
    {
        "id": 15,
        "name": "恶魔高校的最强姬神",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10045.webp",
        "latestEpisode": 12,
        "latestUpdate": "2023-10-03",
        "subteam": "LL字幕组",
    },
    {
        "id": 16,
        "name": "生化危机：无尽黑暗",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10046.webp",
        "latestEpisode": 1,
        "latestUpdate": "2023-09-29",
        "subteam": "MM字幕组",
    },
    {
        "id": 17,
        "name": "咒术回战",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10047.webp",
        "latestEpisode": 9,
        "latestUpdate": "2023-10-02",
        "subteam": "NN字幕组",
    },
    {
        "id": 18,
        "name": "某科学的超电磁炮",
        "pictureUrl": "https://blue-archive.io/image/avatar_students/10048.webp",
        "latestEpisode": 16,
        "latestUpdate": "2023-09-30",
        "subteam": "OO字幕组",
    },
]


@novel_bp.route("/api/novel", methods=["GET"])
def novel_home1():
    # 返回动漫页的首页
    return jsonify(novel_list)
