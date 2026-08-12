from flask import Blueprint, render_template

from blueprints.helpers import get_category_totals
from models import Category, Expense

graphs_bp = Blueprint("graphs", __name__)


@graphs_bp.route("/graphs")
def index():
    expenses = Expense.query.order_by(Expense.expense_date).all()
    categories = Category.query.order_by(Category.name).all()
    # Sorted by total desc, same order dashboard.html renders its category
    # cards in, so per-category chart colors (assigned by DOM order) match
    # between the Dashboard and this page.
    category_totals = get_category_totals(categories, Expense)
    expenses_json = [
        {"category": e.category, "amount": e.amount, "date": e.expense_date.isoformat()}
        for e in expenses
    ]

    return render_template(
        "graphs.html",
        category_totals=category_totals,
        expenses_json=expenses_json,
    )
