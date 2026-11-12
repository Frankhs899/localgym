"""The session endpoints the SPA talks to (issue #4: S2, S3, S5, S19, S20).

Contract under test:
- `POST /api/auth/login/`, `POST /api/auth/logout/`, `GET /api/auth/csrf/`
  and `GET /api/me/` are the only endpoints with defined behavior without a
  session; everything else answers 404 without one.
- `PUT /api/me/password/` changes the own password after verifying the
  current one, and the session survives the change.
- A write without a valid `X-CSRFToken` fails with 403; with the header it
  passes.
"""

import json

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.tests.support import STAFF_PASSWORD, SpaClient, make_staff_user

NEW_PASSWORD = 'clave-nueva-segura-99'


class AuthApiTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = make_staff_user()
        cls.staff.save()

    def setUp(self):
        # The SPA client: CSRF enforced, JSON bodies, token header (S5/S20).
        self.client = SpaClient()

    def login(self, **overrides):
        data = {'username': 'recepcion1', 'password': STAFF_PASSWORD}
        data.update(overrides)
        return self.client.write(
            self.client.post, reverse('accounts:auth-login'), data
        )


class NonApiCsrfFailureTests(TestCase):
    """R3-001: only /api/ failures use the JSON view; other paths (the
    admin) keep Django's HTML 403 diagnostic and the API keeps S5/S19."""

    def test_a_non_api_csrf_failure_keeps_djangos_html_diagnostic(self):
        response = Client(enforce_csrf_checks=True).post(reverse('admin:login'))
        self.assertEqual(response.status_code, 403)
        self.assertTrue(response['Content-Type'].startswith('text/html'))
        self.assertNotIn('Fallo de verificación CSRF'.encode(), response.content)
        self.assertIn('Verificación CSRF fallida'.encode(), response.content)

    def test_an_api_write_without_the_token_still_answers_the_json_403(self):
        client = SpaClient()
        client.fetch_csrf_cookie()
        response = client.post(
            reverse('accounts:auth-login'),
            data='{}',
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json(), {'detail': 'Fallo de verificación CSRF.'})

class CsrfCookieTests(TestCase):
    """S20: the SPA reads csrftoken from JS, so the cookie is not HttpOnly."""

    def test_the_csrf_cookie_is_set_and_readable_by_js(self):
        client = SpaClient()
        token = client.fetch_csrf_cookie()
        self.assertTrue(token)
        self.assertFalse(client.cookies['csrftoken']['httponly'])


class LoginTests(AuthApiTestCase):
    def test_login_opens_a_session_and_returns_the_user_payload(self):
        response = self.login()
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body['username'], 'recepcion1')
        self.assertEqual(body['first_name'], 'Ana')
        self.assertEqual(body['last_name'], 'Gómez')
        self.assertEqual(body['role'], 'recepcion')
        self.assertEqual(body['role_display'], 'Recepción')
        me = self.client.get(reverse('accounts:me'))
        self.assertEqual(me.status_code, 200)

    def test_login_rejects_wrong_credentials_without_a_session(self):
        response = self.login(password='contraseña-equivocada')
        self.assertEqual(response.status_code, 400)
        self.assertIn('incorrectos', response.json()['detail'])
        me = self.client.get(reverse('accounts:me'))
        self.assertEqual(me.status_code, 404)

    def test_login_rejects_an_unknown_user(self):
        response = self.login(username='nadie')
        self.assertEqual(response.status_code, 400)

    def test_login_without_the_csrf_header_is_rejected_with_403(self):
        self.client.fetch_csrf_cookie()
        response = self.client.post(
            reverse('accounts:auth-login'),
            data=json.dumps(
                {'username': 'recepcion1', 'password': STAFF_PASSWORD}
            ),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 403)
        me = self.client.get(reverse('accounts:me'))
        self.assertEqual(me.status_code, 404)

    def test_login_rejects_a_body_that_is_not_json(self):
        response = self.client.write(
            self.client.post, reverse('accounts:auth-login'), None
        )
        self.assertEqual(response.status_code, 400)


class MeTests(AuthApiTestCase):
    """S2/S19: /api/me/ is the only read endpoint with defined behavior."""

    def test_me_returns_the_user_and_role_with_a_session(self):
        self.login()
        response = self.client.get(reverse('accounts:me'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            set(response.json()),
            {'username', 'first_name', 'last_name', 'role', 'role_display'},
        )

    def test_me_is_404_without_a_session(self):
        response = self.client.get(reverse('accounts:me'))
        self.assertEqual(response.status_code, 404)
        self.assertIn('detail', response.json())


class LogoutTests(AuthApiTestCase):
    """S19: logout has defined behavior even without a session."""

    def test_logout_closes_the_session(self):
        self.login()
        response = self.client.write(
            self.client.post, reverse('accounts:auth-logout')
        )
        self.assertEqual(response.status_code, 204)
        me = self.client.get(reverse('accounts:me'))
        self.assertEqual(me.status_code, 404)

    def test_logout_without_a_session_still_succeeds(self):
        response = self.client.write(
            self.client.post, reverse('accounts:auth-logout')
        )
        self.assertEqual(response.status_code, 204)


class PasswordChangeTests(AuthApiTestCase):
    """S3/S12/S17: the own password changes after verifying the current one."""

    def change_password(self, **overrides):
        data = {'current_password': STAFF_PASSWORD, 'new_password': NEW_PASSWORD}
        data.update(overrides)
        return self.client.write(
            self.client.put, reverse('accounts:me-password'), data
        )

    def test_the_password_changes_and_the_session_survives(self):
        self.login()
        response = self.change_password()
        self.assertEqual(response.status_code, 200)
        self.staff.refresh_from_db()
        self.assertFalse(self.staff.check_password(STAFF_PASSWORD))
        self.assertTrue(self.staff.check_password(NEW_PASSWORD))
        me = self.client.get(reverse('accounts:me'))
        self.assertEqual(me.status_code, 200)

    def test_the_current_password_is_verified(self):
        self.login()
        response = self.change_password(current_password='no-es-la-actual')
        self.assertEqual(response.status_code, 400)
        self.assertIn(
            'actual es incorrecta', response.json()['current_password'][0]
        )
        self.staff.refresh_from_db()
        self.assertTrue(self.staff.check_password(STAFF_PASSWORD))

    def test_the_new_password_is_validated(self):
        self.login()
        response = self.change_password(new_password='123')
        self.assertEqual(response.status_code, 400)
        self.assertIn('new_password', response.json())
        self.staff.refresh_from_db()
        self.assertTrue(self.staff.check_password(STAFF_PASSWORD))

    def test_password_change_is_404_without_a_session(self):
        response = self.change_password()
        self.assertEqual(response.status_code, 404)
        self.staff.refresh_from_db()
        self.assertTrue(self.staff.check_password(STAFF_PASSWORD))

    def test_password_change_without_the_csrf_header_is_rejected_with_403(self):
        self.login()
        response = self.client.put(
            reverse('accounts:me-password'),
            data=json.dumps(
                {
                    'current_password': STAFF_PASSWORD,
                    'new_password': NEW_PASSWORD,
                }
            ),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 403)
        self.staff.refresh_from_db()
        self.assertTrue(self.staff.check_password(STAFF_PASSWORD))
