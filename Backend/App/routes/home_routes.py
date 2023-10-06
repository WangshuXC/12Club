from flask import Blueprint, jsonify

home_bp = Blueprint("home", __name__)

# 下载更新
img_list0 = [
    "http://12club.nankai.edu.cn/upload/images/1696485103.0452442.jpg",
    "http://12club.nankai.edu.cn/upload/images/1696476421.4458344.jpg",
    "http://12club.nankai.edu.cn/upload/images/1696476477.7200944.jpg",
    "http://12club.nankai.edu.cn/upload/images/1696337498.1139002.jpg",
    "http://12club.nankai.edu.cn/upload/images/1695996968.127501.jpg",
    "http://12club.nankai.edu.cn/upload/images/1691641907.758122.jpg",
    "http://12club.nankai.edu.cn/upload/images/1688335885.6219602.jpg",
]
name_list0 = [
    "想要成为影之实力者！ 第二季",
    "16bit的感动 ANOTHER LAYER",
    "香格里拉·弗陇提亚～屎作猎人向神作发起挑战～",
    "我推是反派大小姐",
    "葬送的芙莉莲",
    "不死少女 杀人笑剧",
    "无职转生Ⅱ ～到了异世界就拿出真本事～",
]

# 动漫更新
img_list1 = [
    "http://12club.nankai.edu.cn/upload/images/1692015321.558317.jpg",
    "http://12club.nankai.edu.cn/upload/images/1691642153.3353221.jpg",
    "http://12club.nankai.edu.cn/upload/images/1292645069.04556.jpg",
    "http://12club.nankai.edu.cn/upload/images/1689496541.1579213.jpg",
    "http://12club.nankai.edu.cn/upload/images/1676184415.3763716.jpg",
    "http://12club.nankai.edu.cn/upload/images/1680842055.1723762.jpg",
    "http://12club.nankai.edu.cn/upload/images/1682784769.7348607.jpg",
]
name_list1 = ["番剧1", "番剧2", "番剧3", "番剧4", "番剧5", "番剧6", "番剧7"]

# 漫画更新
img_list2 = [
    "http://12club.nankai.edu.cn/upload/images/1683380153.9022834.jpg",
    "http://12club.nankai.edu.cn/upload/images/1662259809.9725282.png",
    "http://12club.nankai.edu.cn/upload/images/1653875915.6771998.png",
    "http://12club.nankai.edu.cn/upload/images/1257138541.9568.jpg",
    "http://12club.nankai.edu.cn/upload/images/1607494151.7610898.png",
    "http://12club.nankai.edu.cn/upload/images/1650198755.4942765.jpg",
    "http://12club.nankai.edu.cn/upload/images/1649607527.1329308.jpg",
]
name_list2 = ["番剧1", "番剧2", "番剧3", "番剧4", "番剧5", "番剧6", "番剧7"]

# 小说更新
img_list3 = [
    "http://12club.nankai.edu.cn/upload/images/1663253819.3367639.jpg",
    "http://12club.nankai.edu.cn/upload/images/1616738300.4931633.png",
    "http://12club.nankai.edu.cn/upload/images/1574427873.2569954.jpg",
    "http://12club.nankai.edu.cn/upload/images/1574427984.5524557.jpeg",
    "http://12club.nankai.edu.cn/upload/images/1574427455.3186545.jpg",
    "http://12club.nankai.edu.cn/upload/images/1555827305.8916636.png",
    "http://12club.nankai.edu.cn/upload/images/1483968676.5552256.jpg",
]
name_list3 = ["番剧1", "番剧2", "番剧3", "番剧4", "番剧5", "番剧6", "番剧7"]


@home_bp.route("/api/update0", methods=["GET"])
def home_home0():
    # 返回动漫页的首页
    return jsonify(img_list0, name_list0)


@home_bp.route("/api/update1", methods=["GET"])
def home_home1():
    # 返回动漫页的首页
    return jsonify(img_list1, name_list1)


@home_bp.route("/api/update2", methods=["GET"])
def home_home2():
    # 返回动漫页的首页
    return jsonify(img_list2, name_list2)


@home_bp.route("/api/update3", methods=["GET"])
def home_home3():
    # 返回动漫页的首页
    return jsonify(img_list3, name_list3)
