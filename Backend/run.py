from App import create_app

app = create_app()

if __name__ == "__main__":
    app.run(port=5174, host="0.0.0.0")
