"""DRF authentication for the session-cookie SPA (issue #4: S4, S5, S19)."""

from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import APIException, PermissionDenied


class CsrfFailure(APIException):
    """The only 403 in the API contract: a failed CSRF check (S4/S5)."""

    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Fallo de verificación CSRF.'
    default_code = 'csrf_failure'


class SessionAuthentication(SessionAuthentication):
    """SessionAuthentication whose CSRF failures are distinguishable.

    DRF reports CSRF failures as PermissionDenied, the same exception a
    permission denial raises; the contract needs them apart — 403 only for
    CSRF, 404 for everything a session or role does not grant — so CSRF
    failures carry their own exception and the permission layer answers
    404 with drf NotFound.
    """

    def enforce_csrf(self, request):
        try:
            super().enforce_csrf(request)
        except PermissionDenied:
            # The original reason is Django's English message; the SPA gets
            # the contract's Spanish text instead (S5, es-co).
            raise CsrfFailure() from None
