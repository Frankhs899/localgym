"""The owner's own account, created from the command line (S7 and S22).

Staff alta runs through /admin/, so `createsuperuser` is the one path that
must produce a fully specified account instead of side-stepping the model's
required fields.
"""

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

SUPERUSER_ARGS = {
    'username': 'dueno',
    'email': 'dueno@example.com',
    'first_name': 'Dueño',
    'last_name': 'Gimnasio',
    'phone': '3001112233',
}


class CreateSuperuserTests(TestCase):
    def test_createsuperuser_takes_the_staff_fields_and_becomes_admin(self):
        call_command('createsuperuser', interactive=False, verbosity=0, **SUPERUSER_ARGS)
        owner = get_user_model().objects.get(username='dueno')
        self.assertEqual(owner.role, 'admin')
        self.assertTrue(owner.is_staff)
        self.assertTrue(owner.is_superuser)

    def test_createsuperuser_refuses_to_skip_the_phone(self):
        incomplete = {
            name: value for name, value in SUPERUSER_ARGS.items() if name != 'phone'
        }
        with self.assertRaises(CommandError):
            call_command('createsuperuser', interactive=False, verbosity=0, **incomplete)
        self.assertFalse(get_user_model().objects.filter(username='dueno').exists())
