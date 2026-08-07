from flask import Blueprint, render_template

income_bp = Blueprint("income", __name__)


@income_bp.route("/income")
def index():
    return render_template("income.html")
