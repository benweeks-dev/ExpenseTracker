from datetime import date

from flask import Blueprint, render_template
from sqlalchemy import func

from models import Category, Expense, db

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/")
def index():
    expenses = Expense.query.order_by(Expense.expense_date.desc(), Expense.date_added.desc()).all()
    categories = Category.query.order_by(Category.name).all()
    total = sum(e.amount for e in expenses)

    category_sums = dict(
        db.session.query(Expense.category, func.sum(Expense.amount)).group_by(Expense.category).all()
    )
    category_totals = sorted(
        (
            {
                "id": c.id,
                "name": c.name,
                "emoji": c.emoji,
                "total": category_sums.get(c.name, 0.0),
                "deletable": c.name not in category_sums,
            }
            for c in categories
        ),
        key=lambda c: c["total"],
        reverse=True,
    )
    category_emojis = {c.name: c.emoji for c in categories}

    return render_template(
        "dashboard.html",
        expenses=expenses,
        categories=categories,
        category_totals=category_totals,
        category_emojis=category_emojis,
        total=total,
        today=date.today(),
    )
