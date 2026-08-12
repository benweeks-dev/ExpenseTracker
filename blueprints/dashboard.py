from datetime import date

from flask import Blueprint, render_template

from blueprints.helpers import get_category_totals
from models import Category, Expense

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/")
def index():
    expenses = Expense.query.order_by(Expense.expense_date.desc(), Expense.date_added.desc()).all()
    categories = Category.query.order_by(Category.name).all()
    total = sum(e.amount for e in expenses)

    category_totals = get_category_totals(categories)
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
