"""What a staff account is (issue #4: S1 and S22)."""

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.accounts.tests.support import make_staff_user


class UserModelTests(TestCase):
    """The project user model is accounts.User and it carries a role (S1)."""

    def test_the_project_user_model_is_accounts_user(self):
        self.assertEqual(get_user_model()._meta.label, 'accounts.User')

    def test_the_user_model_carries_role_and_phone(self):
        field_names = {field.name for field in get_user_model()._meta.get_fields()}
        self.assertIn('role', field_names)
        self.assertIn('phone', field_names)

    def test_role_offers_exactly_admin_recepcion_and_profesor(self):
        role = get_user_model().Role
        self.assertEqual(
            [value for value, _label in role.choices],
            ['admin', 'recepcion', 'profesor'],
        )
        self.assertEqual(role.ADMIN, 'admin')
        self.assertEqual(role.RECEPCION, 'recepcion')
        self.assertEqual(role.PROFESOR, 'profesor')

    def test_role_rejects_a_value_outside_the_three_roles(self):
        user = make_staff_user(role='socio')
        with self.assertRaises(ValidationError) as caught:
            user.full_clean()
        self.assertIn('role', caught.exception.error_dict)

    def test_a_staff_user_is_identified_by_name_not_by_username(self):
        # S22: the UI shows the real name; __str__ is what the admin and any
        # future FK display use, so it must not fall back to the username.
        self.assertEqual(str(make_staff_user()), 'Ana Gómez')


class StaffRequiredFieldsTests(TestCase):
    """S22: the alta mínima productiva and its optional field."""

    def test_a_fully_specified_staff_account_is_valid(self):
        make_staff_user().full_clean()

    def test_email_is_optional(self):
        user = make_staff_user(email='')
        user.full_clean()
        self.assertEqual(user.email, '')

    def test_each_required_field_is_rejected_when_missing(self):
        required = ('username', 'first_name', 'last_name', 'phone', 'role')
        for field_name in required:
            with self.subTest(missing=field_name):
                user = make_staff_user(**{field_name: ''})
                with self.assertRaises(ValidationError) as caught:
                    user.full_clean()
                self.assertIn(field_name, caught.exception.error_dict)


class StaffAttributionFieldTests(TestCase):
    """S23: business records will point at the staff user who created them.

    The FK itself belongs to #5 and #7; what #4 must guarantee is that the
    user it hands them is a real, persisted staff account that also carries
    the creation timestamp they will copy.
    """

    def test_a_persisted_staff_user_stays_readable_with_its_role(self):
        user = make_staff_user()
        user.save()
        stored = get_user_model().objects.get(pk=user.pk)
        self.assertEqual(stored.role, 'recepcion')
        self.assertLessEqual(stored.date_joined, timezone.now())
