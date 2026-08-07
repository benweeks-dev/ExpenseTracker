from flask import Blueprint, render_template

transactions_bp = Blueprint("transactions", __name__)


@transactions_bp.route("/transactions")
def index():
    return render_template("transactions.html")
