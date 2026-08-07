from datetime import datetime

from flask import Blueprint, redirect, request, url_for

from blueprints.helpers import validation_error
from models import Expense, db

NEW_CATEGORY_SENTINEL = "__new__"

expenses_bp = Blueprint("expenses", __name__)


@expenses_bp.route("/add", methods=["POST"])
def add_expense():
    category = request.form.get("category", "").strip()
    description = request.form.get("description", "").strip()
    amount_raw = request.form.get("amount", "")
    expense_date_raw = request.form.get("expense_date", "")

    if len(category) > 30:
        return validation_error("Category must be 30 characters or fewer.", "expense_error", url_for("dashboard.index"))
    if len(description) > 255:
        return validation_error("Description must be 255 characters or fewer.", "expense_error", url_for("dashboard.index"))

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

    return redirect(url_for("dashboard.index"))


@expenses_bp.route("/expenses/<int:expense_id>/edit", methods=["POST"])
def edit_expense(expense_id):
    expense = db.session.get(Expense, expense_id)
    if not expense:
        return redirect(url_for("dashboard.index"))

    category = request.form.get("category", "").strip()
    description = request.form.get("description", "").strip()
    amount_raw = request.form.get("amount", "")
    expense_date_raw = request.form.get("expense_date", "")

    if len(category) > 30:
        return validation_error("Category must be 30 characters or fewer.", "edit_expense_error", url_for("dashboard.index", edit_error=expense_id))
    if len(description) > 255:
        return validation_error("Description must be 255 characters or fewer.", "edit_expense_error", url_for("dashboard.index", edit_error=expense_id))

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
        expense.amount = amount
        expense.category = category
        expense.description = description or None
        expense.expense_date = expense_date
        db.session.commit()

    return redirect(url_for("dashboard.index"))


@expenses_bp.route("/delete/<int:expense_id>", methods=["POST"])
def delete_expense(expense_id):
    expense = db.session.get(Expense, expense_id)
    if expense:
        db.session.delete(expense)
        db.session.commit()

    return redirect(url_for("dashboard.index"))
