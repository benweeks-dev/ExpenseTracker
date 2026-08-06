from datetime import date, datetime

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates

db = SQLAlchemy()


class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(30), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    expense_date = db.Column(db.Date, nullable=False, default=date.today)
    date_added = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    @validates('description')
    def validate_description(self, key, value):
        if value and len(value) > 255:
            raise ValueError("Description cannot exceed 255 characters")
        return value

    @validates('category')
    def validate_category(self, key, value):
        if value and len(value) > 255:
            raise ValueError("category cannot exceed 30 characters")
        return value

    def __repr__(self):
        return f"<Expense {self.id} {self.category} {self.amount}>"


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), unique=True, nullable=False)
    emoji = db.Column(db.String(8), nullable=True)

    def __repr__(self):
        return f"<Category {self.name}>"
