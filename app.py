import os

from flask import Flask, flash, redirect, render_template, request, url_for

from config import Config
from models import Category, Expense, db

NEW_CATEGORY_SENTINEL = "__new__"

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(Config)

os.makedirs(app.instance_path, exist_ok=True)
db.init_app(app)

with app.app_context():
    db.create_all()
    if not Category.query.filter_by(name="Other").first():
        db.session.add(Category(name="Other"))
        db.session.commit()


@app.route("/")
def index():
    expenses = Expense.query.order_by(Expense.date_added.desc()).all()
    categories = Category.query.order_by(Category.name).all()
    total = sum(e.amount for e in expenses)
    return render_template("index.html", expenses=expenses, categories=categories, total=total)


@app.route("/add", methods=["POST"])
def add_expense():
    category = request.form.get("category", "").strip()
    description = request.form.get("description", "").strip()
    amount_raw = request.form.get("amount", "")

    try:
        amount = float(amount_raw)
    except ValueError:
        amount = None

    if category and category != NEW_CATEGORY_SENTINEL and amount is not None and amount > 0:
        expense = Expense(amount=amount, category=category, description=description or None)
        db.session.add(expense)
        db.session.commit()

    return redirect(url_for("index"))


@app.route("/categories/add", methods=["POST"])
def add_category():
    raw = request.form.get("name", "").strip()

    if not raw:
        flash("Category name is required.")
    elif len(raw) > 30:
        flash("Category name must be 30 characters or fewer.")
    else:
        formatted = " ".join(w.capitalize() for w in raw.split())
        if Category.query.filter_by(name=formatted).first():
            flash("Category already exists.")
        else:
            db.session.add(Category(name=formatted))
            db.session.commit()
            return redirect(url_for("index", new=formatted))

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
