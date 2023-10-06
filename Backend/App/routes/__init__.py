from flask import Blueprint

# 创建动漫页蓝图
home_bp = Blueprint(
    "home",
    __name__,
)
anime_bp = Blueprint(
    "anime",
    __name__,
)
comic_bp = Blueprint(
    "comic",
    __name__,
)
novel_bp = Blueprint(
    "novel",
    __name__,
)
admin_bp = Blueprint(
    "admin",
    __name__,
)

# 导入动漫页路由处理函数
from .home_routes import *
from .anime_routes import *
from .comic_routes import *
from .novel_routes import *
from .admin_routes import *


# 注册蓝图到 Flask 应用中
def init_app(app):
    app.register_blueprint(home_bp)
    app.register_blueprint(anime_bp)
    app.register_blueprint(comic_bp)
    app.register_blueprint(novel_bp)
    app.register_blueprint(admin_bp)
