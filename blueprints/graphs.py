from flask import Blueprint, render_template

graphs_bp = Blueprint("graphs", __name__)


@graphs_bp.route("/graphs")
def index():
    return render_template("graphs.html")
