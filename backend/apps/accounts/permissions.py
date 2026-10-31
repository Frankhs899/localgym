"""The role permission layer behind the Fase 1 matrix (issue #4: S4, S24, S25)."""

from rest_framework.exceptions import NotFound
from rest_framework.permissions import SAFE_METHODS, BasePermission


class RoleRequired(BasePermission):
    """Fail-closed role gate implementing the permission matrix (S24).

    A resource view declares read_roles (safe methods) and write_roles
    (unsafe methods). A request that is not authenticated, or whose role is
    not declared for its method, gets the same 404 a missing resource would
    give (S4/S19): session absence, missing permission and missing resource
    are indistinguishable, and 403 stays reserved for CSRF failures.
    Declaring neither list leaves the view invisible to everyone (S25: the
    mechanism fails closed; each Fase 1 issue opens its own resources).
    """

    message = 'No encontrado.'

    def has_permission(self, request, view):
        read_roles = getattr(view, 'read_roles', None)
        write_roles = getattr(view, 'write_roles', None)
        if read_roles is None and write_roles is None:
            raise NotFound(self.message)
        if not request.user.is_authenticated:
            raise NotFound(self.message)
        declared = read_roles if request.method in SAFE_METHODS else write_roles
        if request.user.role not in (declared or ()):
            raise NotFound(self.message)
        return True
