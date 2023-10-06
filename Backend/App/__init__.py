from flask import Flask
from flask_cors import CORS


def create_app():
    # 创建 Flask 应用程序对象
    app = Flask(__name__)
    app.config.from_object(__name__)
    # 导入配置
    app.config.from_object("config.DevelopmentConfig")
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    # 注册蓝图
    from .routes import init_app

    init_app(app)

    return app
