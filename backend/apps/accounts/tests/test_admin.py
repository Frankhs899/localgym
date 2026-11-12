"""Staff management from Django admin (issue #4: S7, S16, S17 and S22)."""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from apps.accounts.tests.support import STAFF_PASSWORD, staff_data

ADD_URL = 'admin:accounts_user_add'
CHANGE_URL = 'admin:accounts_user_change'
CHANGELIST_URL = 'admin:accounts_user_changelist'
OWNER_PASSWORD = 'owner-password-2026'


class StaffAdminTests(TestCase):
    """The owner is the only /admin/ user; staff accounts are created there."""

    @classmethod
    def setUpTestData(cls):
        cls.owner = get_user_model().objects.create_superuser(
            username='dueno',
            email='dueno@example.com',
            password=OWNER_PASSWORD,
            first_name='Dueño',
            last_name='Gimnasio',
            phone='3001112233',
        )

    def setUp(self):
        self.client.force_login(self.owner)

    def post_add(self, **overrides):
        data = {
            **staff_data(username='nuevo-staff'),
            'usable_password': 'true',
            'password1': STAFF_PASSWORD,
            'password2': STAFF_PASSWORD,
        }
        data.update(overrides)
        return self.client.post(reverse(ADD_URL), data)

    def test_the_owner_creates_a_staff_user_with_its_role(self):
        response = self.post_add()
        self.assertRedirects(response, reverse(CHANGELIST_URL))
        user = get_user_model().objects.get(username='nuevo-staff')
        self.assertEqual(user.role, 'recepcion')
        self.assertEqual(user.first_name, 'Ana')
        self.assertEqual(user.last_name, 'Gómez')
        self.assertEqual(user.phone, '3001234567')
        self.assertTrue(user.is_active)
        self.assertTrue(user.check_password(STAFF_PASSWORD))

    def test_creating_staff_never_grants_django_admin_access(self):
        # S7: /admin/ belongs to the owner. Even when the request carries the
        # privilege checkboxes, the alta form ignores them.
        self.post_add(is_staff='on', is_superuser='on')
        user = get_user_model().objects.get(username='nuevo-staff')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_the_add_form_requires_the_staff_fields(self):
        for field_name in ('first_name', 'last_name', 'phone', 'role'):
            with self.subTest(missing=field_name):
                missing_username = f'falta-{field_name}'
                response = self.post_add(username=missing_username, **{field_name: ''})
                self.assertEqual(response.status_code, 200)
                self.assertIn(field_name, response.context['adminform'].form.errors)
                self.assertFalse(
                    get_user_model().objects.filter(username=missing_username).exists()
                )

    def test_the_change_form_edits_role_and_phone(self):
        # S7: the role is visible and editable after the alta.
        user = get_user_model().objects.create_user(
            password=STAFF_PASSWORD, **staff_data(username='cambia-rol')
        )
        response = self.client.post(
            reverse(CHANGE_URL, args=[user.pk]),
            {
                **staff_data(
                    username='cambia-rol', role='profesor', phone='3109998877'
                ),
                'is_active': 'on',
            },
        )
        self.assertRedirects(response, reverse(CHANGELIST_URL))
        user.refresh_from_db()
        self.assertEqual(user.role, 'profesor')
        self.assertEqual(user.phone, '3109998877')
        self.assertTrue(user.is_active)

    def test_the_staff_list_shows_the_role_and_the_real_name(self):
        get_user_model().objects.create_user(
            password=STAFF_PASSWORD, **staff_data(username='en-lista')
        )
        response = self.client.get(reverse(CHANGELIST_URL))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Ana Gómez')
        self.assertContains(response, 'Recepción')
