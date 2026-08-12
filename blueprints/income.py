from calendar import monthrange
from datetime import date, datetime, timedelta

from flask import Blueprint, flash, redirect, render_template, request, url_for

from blueprints.helpers import get_category_totals, validation_error
from models import Income, IncomeCategory, RecurringIncome, db

NEW_CATEGORY_SENTINEL = "__new__"
FREQUENCIES = {"weekly", "biweekly", "monthly", "yearly"}

income_bp = Blueprint("income", __name__)


def _add_months(base_date, months):
    month_index = base_date.month - 1 + months
    year = base_date.year + month_index // 12
    month = month_index % 12 + 1
    day = min(base_date.day, monthrange(year, month)[1])
    return date(year, month, day)


def iter_occurrences(rule):
    """Yield a recurring rule's occurrence dates in order, stopping at end_date (if set)."""
    if rule.frequency in ("weekly", "biweekly"):
        step_days = 7 if rule.frequency == "weekly" else 14
        current = rule.start_date
        while not rule.end_date or current <= rule.end_date:
            yield current
            current += timedelta(days=step_days)
    else:
        months_step = 12 if rule.frequency == "yearly" else 1
        n = 0
        while True:
            current = _add_months(rule.start_date, n)
            if rule.end_date and current > rule.end_date:
                return
            yield current
            n += months_step


def get_occurrences(rule, up_to):
    occurrences = []
    for occurrence in iter_occurrences(rule):
        if occurrence > up_to:
            break
        occurrences.append(occurrence)
    return occurrences


def get_next_occurrence(rule, after):
    for occurrence in iter_occurrences(rule):
        if occurrence > after:
            return occurrence
    return None


def get_due_occurrences(rule, up_to):
    logged_dates = {i.income_date for i in Income.query.filter_by(recurring_income_id=rule.id).all()}
    return [d for d in get_occurrences(rule, up_to) if d not in logged_dates]


@income_bp.route("/income")
def index():
    income_categories = IncomeCategory.query.order_by(IncomeCategory.name).all()
    income_entries = Income.query.order_by(Income.income_date.desc(), Income.date_added.desc()).all()
    total = sum(i.amount for i in income_entries)
    category_totals = get_category_totals(income_categories, Income)
    category_emojis = {c.name: c.emoji for c in income_categories}

    today = date.today()
    recurring_rules = RecurringIncome.query.order_by(RecurringIncome.start_date.desc()).all()
    recurring_data = []
    for rule in recurring_rules:
        due_dates = get_due_occurrences(rule, today) if rule.active else []
        next_date = get_next_occurrence(rule, today) if rule.active else None
        recurring_data.append({"rule": rule, "due_dates": due_dates, "next_date": next_date})

    return render_template(
        "income.html",
        income_categories=income_categories,
        income_entries=income_entries,
        category_totals=category_totals,
        category_emojis=category_emojis,
        total=total,
        recurring_data=recurring_data,
        today=today,
    )


@income_bp.route("/income/add", methods=["POST"])
def add_income():
    category = request.form.get("category", "").strip()
    description = request.form.get("description", "").strip()
    amount_raw = request.form.get("amount", "")
    income_date_raw = request.form.get("income_date", "")

    if len(category) > 30:
        return validation_error("Category must be 30 characters or fewer.", "income_error", url_for("income.index"))
    if len(description) > 255:
        return validation_error("Description must be 255 characters or fewer.", "income_error", url_for("income.index"))

    try:
        amount = float(amount_raw)
    except ValueError:
        amount = None

    try:
        income_date = datetime.strptime(income_date_raw, "%Y-%m-%d").date()
    except ValueError:
        income_date = None

    if (
        category
        and category != NEW_CATEGORY_SENTINEL
        and amount is not None
        and amount > 0
        and income_date is not None
    ):
        db.session.add(Income(amount=amount, category=category, description=description or None, income_date=income_date))
        db.session.commit()

    return redirect(url_for("income.index"))


@income_bp.route("/income/<int:income_id>/edit", methods=["POST"])
def edit_income(income_id):
    income = db.session.get(Income, income_id)
    if not income:
        return redirect(url_for("income.index"))

    category = request.form.get("category", "").strip()
    description = request.form.get("description", "").strip()
    amount_raw = request.form.get("amount", "")
    income_date_raw = request.form.get("income_date", "")

    if len(category) > 30:
        return validation_error(
            "Category must be 30 characters or fewer.", "edit_income_error", url_for("income.index", edit_error=income_id)
        )
    if len(description) > 255:
        return validation_error(
            "Description must be 255 characters or fewer.", "edit_income_error", url_for("income.index", edit_error=income_id)
        )

    try:
        amount = float(amount_raw)
    except ValueError:
        amount = None

    try:
        income_date = datetime.strptime(income_date_raw, "%Y-%m-%d").date()
    except ValueError:
        income_date = None

    if (
        category
        and category != NEW_CATEGORY_SENTINEL
        and amount is not None
        and amount > 0
        and income_date is not None
    ):
        income.amount = amount
        income.category = category
        income.description = description or None
        income.income_date = income_date
        db.session.commit()

    return redirect(url_for("income.index"))


@income_bp.route("/income/<int:income_id>/delete", methods=["POST"])
def delete_income(income_id):
    income = db.session.get(Income, income_id)
    if income:
        db.session.delete(income)
        db.session.commit()

    return redirect(url_for("income.index"))


@income_bp.route("/income/categories/add", methods=["POST"])
def add_income_category():
    raw = request.form.get("name", "").strip()
    emoji = request.form.get("emoji", "").strip()

    if not raw:
        return validation_error("Category name is required.", "income_category_error", url_for("income.index"))
    if len(raw) > 30:
        return validation_error("Category name must be 30 characters or fewer.", "income_category_error", url_for("income.index"))
    if len(emoji) > 8:
        return validation_error("Emoji must be 8 characters or fewer.", "income_category_error", url_for("income.index"))

    formatted = " ".join(w.capitalize() for w in raw.split())
    if IncomeCategory.query.filter_by(name=formatted).first():
        return validation_error("Category already exists.", "income_category_error", url_for("income.index"))

    db.session.add(IncomeCategory(name=formatted, emoji=emoji or None))
    db.session.commit()
    return redirect(url_for("income.index", new=formatted))


@income_bp.route("/income/categories/<int:category_id>/emoji", methods=["POST"])
def update_income_category_emoji(category_id):
    category = db.session.get(IncomeCategory, category_id)
    if category:
        emoji = request.form.get("emoji", "").strip()
        if len(emoji) <= 8:
            category.emoji = emoji or None
            db.session.commit()

    return redirect(url_for("income.index"))


@income_bp.route("/income/categories/<int:category_id>/delete", methods=["POST"])
def delete_income_category(category_id):
    category = db.session.get(IncomeCategory, category_id)
    if category:
        in_use = (
            Income.query.filter_by(category=category.name).first() is not None
            or RecurringIncome.query.filter_by(category=category.name).first() is not None
        )
        if in_use:
            flash("Cannot delete a category that has income entries or recurring rules.", "income_category_delete")
        else:
            db.session.delete(category)
            db.session.commit()

    return redirect(url_for("income.index"))


def _parse_recurring_form(form):
    """Shared parsing/validation for the add/edit recurring-income forms. Returns (fields_dict, error_message)."""
    category = form.get("category", "").strip()
    description = form.get("description", "").strip()
    amount_raw = form.get("amount", "")
    frequency = form.get("frequency", "").strip()
    start_date_raw = form.get("start_date", "")
    end_date_raw = form.get("end_date", "").strip()
    active = form.get("active") == "on"

    if len(category) > 30:
        return None, "Category must be 30 characters or fewer."
    if len(description) > 255:
        return None, "Description must be 255 characters or fewer."
    if frequency not in FREQUENCIES:
        return None, "Please choose a valid frequency."

    try:
        amount = float(amount_raw)
    except ValueError:
        amount = None

    try:
        start_date = datetime.strptime(start_date_raw, "%Y-%m-%d").date()
    except ValueError:
        start_date = None

    end_date = None
    if end_date_raw:
        try:
            end_date = datetime.strptime(end_date_raw, "%Y-%m-%d").date()
        except ValueError:
            return None, "End date is invalid."

    if end_date and start_date and end_date < start_date:
        return None, "End date must be on or after the start date."

    if (
        not category
        or category == NEW_CATEGORY_SENTINEL
        or amount is None
        or amount <= 0
        or start_date is None
    ):
        return None, None

    return {
        "amount": amount,
        "category": category,
        "description": description or None,
        "frequency": frequency,
        "start_date": start_date,
        "end_date": end_date,
        "active": active,
    }, None


@income_bp.route("/income/recurring/add", methods=["POST"])
def add_recurring_income():
    fields, error = _parse_recurring_form(request.form)
    if error:
        return validation_error(error, "recurring_error", url_for("income.index"))

    if fields:
        db.session.add(RecurringIncome(**fields))
        db.session.commit()

    return redirect(url_for("income.index"))


@income_bp.route("/income/recurring/<int:rule_id>/edit", methods=["POST"])
def edit_recurring_income(rule_id):
    rule = db.session.get(RecurringIncome, rule_id)
    if not rule:
        return redirect(url_for("income.index"))

    fields, error = _parse_recurring_form(request.form)
    if error:
        return validation_error(error, "edit_recurring_error", url_for("income.index", edit_recurring_error=rule_id))

    if fields:
        for key, value in fields.items():
            setattr(rule, key, value)
        db.session.commit()

    return redirect(url_for("income.index"))


@income_bp.route("/income/recurring/<int:rule_id>/delete", methods=["POST"])
def delete_recurring_income(rule_id):
    rule = db.session.get(RecurringIncome, rule_id)
    if rule:
        db.session.delete(rule)
        db.session.commit()

    return redirect(url_for("income.index"))


@income_bp.route("/income/recurring/<int:rule_id>/log", methods=["POST"])
def log_recurring_income(rule_id):
    rule = db.session.get(RecurringIncome, rule_id)
    if not rule or not rule.active:
        return redirect(url_for("income.index"))

    try:
        due_date = datetime.strptime(request.form.get("due_date", ""), "%Y-%m-%d").date()
    except ValueError:
        return redirect(url_for("income.index"))

    if due_date in get_due_occurrences(rule, date.today()):
        db.session.add(Income(
            amount=rule.amount,
            category=rule.category,
            description=rule.description,
            income_date=due_date,
            recurring_income_id=rule.id,
        ))
        db.session.commit()

    return redirect(url_for("income.index"))
