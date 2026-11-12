"""Shared fixtures for the accounts suite (issue #4).

Values follow the "alta mínima productiva" of S22: username, first name,
last name, role and phone are the required fields; email is optional and
empty on purpose, because a gym PC without internet has no email flow.
"""

import json

from django.contrib.auth import get_user_model
from django.test import Client
from django.urls import reverse

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


class SpaClient(Client):
    """A client that speaks like the SPA: JSON plus the X-CSRFToken header.

    Django's test client skips CSRF checks by default, but the real browser
    does not (S5/S20): this client enforces them and sends the header from
    the csrftoken cookie, re-reading it after each response because login
    and logout rotate the token. DRF's own CSRF enforcement also honors the
    test client's skip flag, so CSRF contract tests must use this client.
    """

    def __init__(self, **kwargs):
        super().__init__(enforce_csrf_checks=True, **kwargs)

    def fetch_csrf_cookie(self):
        response = self.get(reverse('accounts:auth-csrf'))
        if response.status_code != 204:
            raise AssertionError(
                f'expected 204 from the csrf endpoint, got {response.status_code}'
            )
        return self.cookies['csrftoken'].value

    def write(self, method, path, payload=None):
        if 'csrftoken' not in self.cookies:
            self.fetch_csrf_cookie()
        data = '' if payload is None else json.dumps(payload)
        return method(
            path,
            data=data,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.cookies['csrftoken'].value,
        )
