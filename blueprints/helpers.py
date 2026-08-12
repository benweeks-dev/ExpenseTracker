from flask import flash, jsonify, redirect, request
from sqlalchemy import func

from models import db


def validation_error(message, category, redirect_url):
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return jsonify(error=message), 400
    flash(message, category)
    return redirect(redirect_url)


def get_category_totals(categories, model):
    category_sums = dict(
        db.session.query(model.category, func.sum(model.amount)).group_by(model.category).all()
    )
    return sorted(
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
