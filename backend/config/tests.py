"""Smoke tests for the Django project (issue #2).

Deliberately minimal: `manage.py test` with zero tests exits 0 without
checking anything, so the CI backend job needs at least one real test to
prove the project boots, routes requests, and persists data. Deeper
coverage (including a fail-closed SECRET_KEY test) belongs to the test
suite that grows with the Fase 1 apps.
"""

import tempfile
from pathlib import Path

from django.conf import settings as django_settings
from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase, override_settings


class SettingsSmokeTests(TestCase):
    """The settings module imports and resolves required values."""

    def test_secret_key_resolves_to_a_non_empty_string(self):
        # LOCALGYM_SECRET_KEY has no default on purpose (fail-closed): if
        # this fails, the environment is not providing the key.
        self.assertIsInstance(django_settings.SECRET_KEY, str)
        self.assertTrue(django_settings.SECRET_KEY)


class AdminSmokeTests(TestCase):
    """URL routing, middleware and templates respond."""

    def test_admin_login_page_responds_200(self):
        response = self.client.get('/admin/login/')
        self.assertEqual(response.status_code, 200)


class DatabaseSmokeTests(TestCase):
    """Migrations and the ORM work against the test database."""

    def test_created_superuser_persists(self):
        user_model = get_user_model()
        admin = user_model.objects.create_superuser(
            username='ci-smoke',
            email='',
            password='ci-only-password',
        )
        self.assertTrue(
            user_model.objects.filter(pk=admin.pk).exists(),
            msg='Created superuser should be readable back from the database',
        )


class SpaServingTests(TestCase):
    """D3 (issue #3): Django serves the compiled SPA from one process/port.

    The SPA entry point is served by a catch-all view for '/' and for any
    client-side route. The view reads settings.FRONTEND_DIST at request
    time, so only the frontend build step decides whether it exists.
    """

    def setUp(self):
        super().setUp()
        # Scratch dist lives in the OS temp dir, outside the worktree.
        self._dist_tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._dist_tmp.cleanup)
        self.dist = Path(self._dist_tmp.name)
        (self.dist / 'index.html').write_text(
            '<!doctype html><title>spa-marker</title>', encoding='utf-8'
        )

    def test_root_serves_spa_index_when_frontend_is_built(self):
        with override_settings(FRONTEND_DIST=self.dist):
            response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'spa-marker', response.content)

    def test_client_side_route_serves_spa_index(self):
        with override_settings(FRONTEND_DIST=self.dist):
            response = self.client.get('/socios/nuevo')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'spa-marker', response.content)

    def test_spa_routes_return_404_when_frontend_is_not_built(self):
        with override_settings(FRONTEND_DIST=self.dist / 'missing'):
            response = self.client.get('/socios/nuevo')
        self.assertEqual(response.status_code, 404)


class SingleProcessServingConfigTests(SimpleTestCase):
    """Wiring the issue #3 live E2E probe exercises (S2/S3/S4).

    These pin the settings-level contract the gym-PC install relies on:
    WhiteNoise placement and roots, the persistent data dir and the
    documented start script's fail-closed gates.
    """

    def test_whitenoise_middleware_sits_right_after_security(self):
        # WhiteNoise docs require it directly after SecurityMiddleware (S2).
        self.assertEqual(
            django_settings.MIDDLEWARE[1],
            'whitenoise.middleware.WhiteNoiseMiddleware',
        )

    def test_whitenoise_root_points_at_the_built_frontend(self):
        self.assertEqual(django_settings.WHITENOISE_ROOT, django_settings.FRONTEND_DIST)
        self.assertEqual(
            django_settings.FRONTEND_DIST,
            Path(django_settings.BASE_DIR).parent / 'frontend' / 'dist',
        )

    def test_static_root_is_backend_staticfiles(self):
        # Matches the .gitignore entry for collectstatic output (S2).
        self.assertEqual(
            django_settings.STATIC_ROOT,
            Path(django_settings.BASE_DIR) / 'staticfiles',
        )

    def test_database_lives_inside_the_persistent_data_dir(self):
        # S4: the persistent data dir never lives inside the backend app
        # directory, so data survives app updates. The DB path itself cannot
        # be asserted here: the test runner swaps DATABASES['default']['NAME']
        # for the in-memory test database before tests run.
        data_dir = Path(django_settings.DATA_DIR)
        base_dir = Path(django_settings.BASE_DIR)
        self.assertNotIn(base_dir, data_dir.parents)

    def test_start_script_gates_on_env_and_points_at_the_guide(self):
        # S3: the documented launcher fails closed without backend/.env.
        script = Path(django_settings.BASE_DIR).parent / 'scripts' / 'start_server.bat'
        self.assertTrue(script.is_file())
        text = script.read_text(encoding='ascii')
        self.assertIn('backend\\.env', text)
        self.assertIn('docs/installation.md', text)
