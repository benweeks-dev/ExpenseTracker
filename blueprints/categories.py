from flask import Blueprint, flash, redirect, request, url_for

from blueprints.helpers import validation_error
from models import Category, Expense, db

categories_bp = Blueprint("categories", __name__)


@categories_bp.route("/categories/add", methods=["POST"])
def add_category():
    raw = request.form.get("name", "").strip()
    emoji = request.form.get("emoji", "").strip()

    if not raw:
        return validation_error("Category name is required.", "category_error", url_for("dashboard.index"))
    if len(raw) > 30:
        return validation_error("Category name must be 30 characters or fewer.", "category_error", url_for("dashboard.index"))
    if len(emoji) > 8:
        return validation_error("Emoji must be 8 characters or fewer.", "category_error", url_for("dashboard.index"))

    formatted = " ".join(w.capitalize() for w in raw.split())
    if Category.query.filter_by(name=formatted).first():
        return validation_error("Category already exists.", "category_error", url_for("dashboard.index"))

    db.session.add(Category(name=formatted, emoji=emoji or None))
    db.session.commit()
    return redirect(url_for("dashboard.index", new=formatted))


@categories_bp.route("/categories/<int:category_id>/emoji", methods=["POST"])
def update_category_emoji(category_id):
    category = db.session.get(Category, category_id)
    if category:
        emoji = request.form.get("emoji", "").strip()
        if len(emoji) <= 8:
            category.emoji = emoji or None
            db.session.commit()

    return redirect(url_for("dashboard.index"))


@categories_bp.route("/categories/<int:category_id>/delete", methods=["POST"])
def delete_category(category_id):
    category = db.session.get(Category, category_id)
    if category:
        has_expenses = Expense.query.filter_by(category=category.name).first() is not None
        if has_expenses:
            flash("Cannot delete a category that has expenses.", "category_delete")
        else:
            db.session.delete(category)
            db.session.commit()

    return redirect(url_for("dashboard.index"))
