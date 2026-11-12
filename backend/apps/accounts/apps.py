from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'

    # The package lives at backend/apps/accounts, but the public identity of
    # the app is 'accounts': AUTH_USER_MODEL, admin URLs and migrations all
    # use the short label (issue #4, L10a).
    name = 'apps.accounts'
    label = 'accounts'
