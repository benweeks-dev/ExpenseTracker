import os

from flask import Flask, redirect, render_template, request, url_for

from config import Config
from models import Expense, db

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(Config)

os.makedirs(app.instance_path, exist_ok=True)
db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/")
def index():
    expenses = Expense.query.order_by(Expense.date_added.desc()).all()
    total = sum(e.amount for e in expenses)
    return render_template("index.html", expenses=expenses, total=total)


@app.route("/add", methods=["POST"])
def add_expense():
    category = request.form.get("category", "").strip()
    description = request.form.get("description", "").strip()
    amount_raw = request.form.get("amount", "")

    try:
        amount = float(amount_raw)
    except ValueError:
        amount = None

    if category and amount is not None and amount > 0:
        expense = Expense(amount=amount, category=category, description=description or None)
        db.session.add(expense)
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
