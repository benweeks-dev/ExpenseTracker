# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Then visit http://127.0.0.1:5000/. There is no test suite, linter, or build step configured — verification means running the app and checking the change in a browser.

## Architecture

Flask app, one Blueprint per page, registered in `app.py`:
- `blueprints/dashboard.py` — expenses dashboard (`/`)
- `blueprints/expenses.py` — expense CRUD actions
- `blueprints/categories.py` — expense category CRUD actions
- `blueprints/income.py` — income page, income categories, and recurring income rules
- `blueprints/graphs.py` — spending charts
- `blueprints/transactions.py` — transaction history view
- `blueprints/helpers.py` — shared logic used across blueprints: `validation_error()` (returns JSON 400 for AJAX form submits vs. flash+redirect for full-page submits) and `get_category_totals()` (sums a model's `amount` grouped by category, used identically for expenses/categories and income/income-categories)

Data model (`models.py`, SQLite via Flask-SQLAlchemy, `db.create_all()` on startup): `Expense`/`Category` and their income equivalents `Income`/`IncomeCategory` are parallel schemas — the two areas of the app (expenses, income) largely mirror each other in both backend and frontend. `RecurringIncome` defines a recurring rule (amount, category, frequency, start/end date); logged `Income` rows reference their originating rule via `recurring_income_id`. Schema migrations are handled ad hoc at startup in `app.py` (inspecting existing columns and running `ALTER TABLE` if a column is missing) rather than through a migration tool.

Frontend is server-rendered Jinja2 (`templates/`) extending `templates/base.html`, styled with Bootstrap 5 + `static/css/style.css`, no JS framework/bundler. `static/js/base.js` loads on every page and holds cross-page conventions:
- `desktopQuery = window.matchMedia("(min-width: 992px)")` — the breakpoint used for JS-driven responsive behavior (sidebar collapse, scroll-box sizing)
- `interceptForm()` — wires a form to submit via `fetch` and render JSON errors inline instead of a full page reload, pairing with `validation_error()` on the backend
- `wireEmojiPicker()` — wires the `emoji-picker` custom element used on category "add/edit" forms
- `sizeFillScrollBoxes()` — dynamically sizes `.income-scroll` / `.expenses-scroll` panels to fill the viewport from their current position to the bottom (not a fixed `vh`, since the amount of content stacked above them varies by page)

Page-specific behavior lives in `static/js/{dashboard,income,graphs}.js`, loaded via each template's `{% block extra_js %}`.
