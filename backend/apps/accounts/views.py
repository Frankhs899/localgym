"""Session authentication endpoints for the SPA (issue #4: S2, S3, S19, S20).

These are session endpoints, not resource APIs: they are plain Django views
so the status contract is exact — 404 for missing sessions on business
reads, 403 reserved for CSRF failures (enforced by CsrfViewMiddleware and
rendered as JSON by csrf_failure). The role permission layer for business
resources lives in the DRF machinery (see permissions, issue #4 T3).
"""

import json

from django.contrib.auth import (
    authenticate,
    update_session_auth_hash,
)
from django.contrib.auth import (
    login as auth_login,
)
from django.contrib.auth import (
    logout as auth_logout,
)
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods, require_POST


def user_payload(user):
    """The user data the SPA may see: identity and role, nothing internal."""
    return {
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'role_display': user.get_role_display(),
    }


def _json_body(request):
    """The parsed JSON object, or None when the body is not one."""
    try:
        body = json.loads(request.body or b'{}')
    except json.JSONDecodeError:
        return None
    return body if isinstance(body, dict) else None


@require_GET
@ensure_csrf_cookie
def csrf_cookie(request):
    """S19/S20: the SPA fetches this first so the csrftoken cookie exists.

    The cookie stays readable by JS (not HttpOnly) because the SPA must send
    it back as the X-CSRFToken header on every write.
    """
    return HttpResponse(status=204)


@require_POST
def login_view(request):
    body = _json_body(request)
    if body is None:
        return JsonResponse({'detail': 'Cuerpo JSON inválido.'}, status=400)
    user = authenticate(
        request,
        username=str(body.get('username') or ''),
        password=str(body.get('password') or ''),
    )
    if user is None:
        # S8: the message is Spanish and never says which part failed.
        # Deactivated staff (S16) fail here too: authenticate() ignores them.
        return JsonResponse(
            {'detail': 'Usuario o contraseña incorrectos.'}, status=400
        )
    auth_login(request, user)
    return JsonResponse(user_payload(user))


@require_POST
def logout_view(request):
    # S19: defined even without a session — it just clears whatever exists.
    auth_logout(request)
    return HttpResponse(status=204)


@require_GET
def me(request):
    # S2/S19: 404, indistinguishable from a missing resource, without a
    # session. The SPA uses this to detect an expired session (S11).
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'No encontrado.'}, status=404)
    return JsonResponse(user_payload(request.user))


@require_http_methods(['PUT'])
def change_password(request):
    """S3/S12/S17: change the own password after verifying the current one."""
    if not request.user.is_authenticated:
        # A business endpoint: the 404 contract applies without a session.
        return JsonResponse({'detail': 'No encontrado.'}, status=404)
    body = _json_body(request)
    if body is None:
        return JsonResponse({'detail': 'Cuerpo JSON inválido.'}, status=400)
    current_password = str(body.get('current_password') or '')
    new_password = str(body.get('new_password') or '')
    if not request.user.check_password(current_password):
        return JsonResponse(
            {'current_password': ['La contraseña actual es incorrecta.']},
            status=400,
        )
    try:
        validate_password(new_password, request.user)
    except ValidationError as error:
        return JsonResponse({'new_password': error.messages}, status=400)
    request.user.set_password(new_password)
    request.user.save()
    # S12: the person stays logged in after changing the own password.
    update_session_auth_hash(request, request.user)
    return JsonResponse({'detail': 'Contraseña actualizada.'})


def csrf_failure(request, reason='', template_name=None):
    """S4/S5: CSRF failures answer 403 — the only 403 in the contract."""
    return JsonResponse({'detail': 'Fallo de verificación CSRF.'}, status=403)
