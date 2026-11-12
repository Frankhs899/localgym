"""Django admin for staff management (issue #4: S7, S16, S17, S22).

The owner is the only /admin/ user and manages the staff there: alta with
username/name/role/password (and the required phone), role visible and
editable afterwards, deactivation by is_active. The privilege checkboxes are
deliberately absent from both forms: is_staff/is_superuser belong to the
owner alone, and no staff alta or edit can grant them.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import User


class StaffCreationForm(AdminUserCreationForm):
    """Django's password alta plus the staff fields (S22).

    The Meta.model switch matters: without it Django would build the form
    against auth.User and reject the role/phone fields.
    """

    class Meta(AdminUserCreationForm.Meta):
        model = User
        fields = AdminUserCreationForm.Meta.fields + (
            'email',
            'first_name',
            'last_name',
            'phone',
            'role',
        )


class StaffChangeForm(UserChangeForm):
    """Editing a staff account: profile and role, never privileges."""

    class Meta(UserChangeForm.Meta):
        model = User


@admin.register(User)
class StaffUserAdmin(DjangoUserAdmin):
    add_form = StaffCreationForm
    form = StaffChangeForm

    def response_add(self, request, obj, post_url_continue=None):
        # Django's UserAdmin reopens the new user's change page after the
        # alta, so missing permissions can be edited afterwards; a staff
        # account carries no privileges to configure, so the staff list is
        # the right landing spot (the behavior the test suite pins).
        return super(DjangoUserAdmin, self).response_add(
            request, obj, post_url_continue
        )

    # S22: the list identifies people by their real name, with the role
    # readable at a glance.
    list_display = ('username', 'get_full_name', 'role', 'phone', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'phone')
    filter_horizontal = ()

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Datos personales'), {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        (_('Rol'), {'fields': ('role',)}),
        (_('Estado'), {'fields': ('is_active',)}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('username', 'usable_password', 'password1', 'password2'),
            },
        ),
        (
            _('Datos del staff'),
            {
                'classes': ('wide',),
                'fields': ('email', 'first_name', 'last_name', 'phone', 'role'),
            },
        ),
    )
