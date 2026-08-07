import os

from flask import Flask
from sqlalchemy import inspect, text

from config import Config
from models import Category, db

from blueprints.categories import categories_bp
from blueprints.dashboard import dashboard_bp
from blueprints.expenses import expenses_bp
from blueprints.graphs import graphs_bp
from blueprints.income import income_bp
from blueprints.transactions import transactions_bp

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(Config)

os.makedirs(app.instance_path, exist_ok=True)
db.init_app(app)

app.register_blueprint(dashboard_bp)
app.register_blueprint(expenses_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(transactions_bp)
app.register_blueprint(graphs_bp)
app.register_blueprint(income_bp)

with app.app_context():
    db.create_all()

    ''' Used for Adding a column to existing table: '''
    inspector = inspect(db.engine)
    columns = [col["name"] for col in inspector.get_columns("expense")]
    if "expense_date" not in columns:
        db.session.execute(text("ALTER TABLE expense ADD COLUMN expense_date DATE"))
        db.session.execute(text("UPDATE expense SET expense_date = date(date_added) WHERE expense_date IS NULL"))
        db.session.commit()

    category_columns = [col["name"] for col in inspector.get_columns("category")]
    if "emoji" not in category_columns:
        db.session.execute(text("ALTER TABLE category ADD COLUMN emoji VARCHAR(8)"))
        db.session.commit()

    if not Category.query.filter_by(name="Other").first():
        db.session.add(Category(name="Other"))
        db.session.commit()


if __name__ == "__main__":
    app.run(debug=True)
