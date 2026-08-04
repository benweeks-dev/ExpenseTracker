import os
from datetime import date, datetime

from flask import Flask, flash, redirect, render_template, request, url_for
from sqlalchemy import func, inspect, text

from config import Config
from models import Category, Expense, db

NEW_CATEGORY_SENTINEL = "__new__"

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(Config)

os.makedirs(app.instance_path, exist_ok=True)
db.init_app(app)

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

@app.route("/")
def index():
    expenses = Expense.query.order_by(Expense.expense_date.desc(), Expense.date_added.desc()).all()
    categories = Category.query.order_by(Category.name).all()
    total = sum(e.amount for e in expenses)

    category_sums = dict(
        db.session.query(Expense.category, func.sum(Expense.amount)).group_by(Expense.category).all()
    )
    category_totals = sorted(
        (
            {"id": c.id, "name": c.name, "emoji": c.emoji, "total": category_sums.get(c.name, 0.0)}
            for c in categories
        ),
        key=lambda c: c["total"],
        reverse=True,
    )

    return render_template(
        "index.html",
        expenses=expenses,
        categories=categories,
        category_totals=category_totals,
        total=total,
        today=date.today(),
    )


@app.route("/add", methods=["POST"])
def add_expense():
    category = request.form.get("category", "").strip()
    description = request.form.get("description", "").strip()
    amount_raw = request.form.get("amount", "")
    expense_date_raw = request.form.get("expense_date", "")

    try:
        amount = float(amount_raw)
    except ValueError:
        amount = None

    try:
        expense_date = datetime.strptime(expense_date_raw, "%Y-%m-%d").date()
    except ValueError:
        expense_date = None

    if (
        category
        and category != NEW_CATEGORY_SENTINEL
        and amount is not None
        and amount > 0
        and expense_date is not None
    ):
        expense = Expense(amount=amount, category=category, description=description or None, expense_date=expense_date)
        db.session.add(expense)
        db.session.commit()

    return redirect(url_for("index"))


@app.route("/categories/add", methods=["POST"])
def add_category():
    raw = request.form.get("name", "").strip()
    emoji = request.form.get("emoji", "").strip()

    if not raw:
        flash("Category name is required.")
    elif len(raw) > 30:
        flash("Category name must be 30 characters or fewer.")
    elif len(emoji) > 8:
        flash("Emoji must be 8 characters or fewer.")
    else:
        formatted = " ".join(w.capitalize() for w in raw.split())
        if Category.query.filter_by(name=formatted).first():
            flash("Category already exists.")
        else:
            db.session.add(Category(name=formatted, emoji=emoji or None))
            db.session.commit()
            return redirect(url_for("index", new=formatted))

    return redirect(url_for("index"))


@app.route("/categories/<int:category_id>/emoji", methods=["POST"])
def update_category_emoji(category_id):
    category = db.session.get(Category, category_id)
    if category:
        emoji = request.form.get("emoji", "").strip()
        if len(emoji) <= 8:
            category.emoji = emoji or None
            db.session.commit()

    return redirect(url_for("index"))


@app.route("/delete/<int:expense_id>", methods=["POST"])
def delete_expense(expense_id):
    expense = db.session.get(Expense, expense_id)
    if expense:
        db.session.delete(expense)
        db.session.commit()

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
