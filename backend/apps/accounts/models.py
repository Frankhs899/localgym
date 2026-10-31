"""Staff accounts with roles: who a gym worker is and what it may do.

Issue #4 (S1, S15, S22, S23): only staff log into the system — admin (dueño),
recepción and profesor — with the minimal productive alta: username, real
name, phone, role and password; email stays optional because a gym without
internet has no email flow. Business records created by #5 and #7 will point
at these users for attribution (S23).
"""

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as DjangoUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(DjangoUserManager):
    """UserManager that turns every superuser into the gym owner (S7)."""

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        # The owner is an admin without prompting (L10d). setdefault keeps an
        # explicitly passed role working if one is ever provided.
        extra_fields.setdefault('role', 'admin')
        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    """A staff account of the gym (the only kind of system user, S15)."""

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        RECEPCION = 'recepcion', 'Recepción'
        PROFESOR = 'profesor', 'Profesor'

    objects = UserManager()

    # S22: name and surname are part of the required alta; AbstractUser ships
    # them blank=True, so they are redefined as required. The admin UI (and
    # the future SPA) shows the real name, never the username.
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)

    phone = models.CharField('teléfono', max_length=20)
    role = models.CharField('rol', max_length=16, choices=Role.choices)

    # L10d: createsuperuser must not be able to produce an owner account in a
    # state the model itself calls invalid. It also declares the CLI options
    # (--first-name, --last-name, --phone) used non-interactively. Email stays
    # first so the prompt order reads naturally; it is optional and may be
    # left blank (S22).
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'phone']

    class Meta(AbstractUser.Meta):
        verbose_name = 'usuario del staff'
        verbose_name_plural = 'usuarios del staff'

    def __str__(self):
        # S22: the real name identifies the person everywhere — the admin
        # lists and the created_by displays of #5/#7 (S23) read this, so it
        # never falls back to the username.
        return f'{self.first_name} {self.last_name}'
