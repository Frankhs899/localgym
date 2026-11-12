"""Shared fixtures for the accounts suite (issue #4).

Values follow the "alta mínima productiva" of S22: username, first name,
last name, role and phone are the required fields; email is optional and
empty on purpose, because a gym PC without internet has no email flow.
"""

from django.contrib.auth import get_user_model

STAFF_PASSWORD = 'gym-staff-password-2026'


def staff_data(**overrides):
    """A valid staff alta as plain field values."""
    data = {
        'username': 'recepcion1',
        'first_name': 'Ana',
        'last_name': 'Gómez',
        'phone': '3001234567',
        'role': 'recepcion',
        'email': '',
    }
    data.update(overrides)
    return data


def make_staff_user(**overrides):
    """An unsaved, fully valid staff user.

    The password is set so full_clean() has nothing to complain about:
    AbstractUser.password is required and only set_password() hashes it.
    """
    user = get_user_model()(**staff_data(**overrides))
    user.set_password(STAFF_PASSWORD)
    return user
