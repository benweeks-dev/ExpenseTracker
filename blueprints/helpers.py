from flask import flash, jsonify, redirect, request


def validation_error(message, category, redirect_url):
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return jsonify(error=message), 400
    flash(message, category)
    return redirect(redirect_url)
