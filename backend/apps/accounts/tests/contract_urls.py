"""Test-only resource views for the permission contract suite (S6).

They exist only under this tests package and are mounted by overriding
ROOT_URLCONF: they stand in for the Fase 1 resources (#5-#9) so the
enforcement mechanism can be pinned before those resources exist (S25).
Each view mirrors one access profile of the matrix (S24).
"""

from django.urls import include, path
from rest_framework.response import Response
from rest_framework.views import APIView


class CrudResource(APIView):
    """The Socios/Membresías/Pagos profile: staff writes, profesor reads."""

    read_roles = ('admin', 'recepcion', 'profesor')
    write_roles = ('admin', 'recepcion')

    def get(self, request):
        return Response({'ok': True})

    def post(self, request):
        return Response({'ok': True}, status=201)


class ReadableByReceptionResource(APIView):
    """The Dashboard profile: admin and recepción read, nobody writes."""

    read_roles = ('admin', 'recepcion')
    write_roles = ()

    def get(self, request):
        return Response({'ok': True})

    def post(self, request):
        return Response({'ok': True}, status=201)


class AdminOnlyResource(APIView):
    """The Respaldos profile: admin only, reads only."""

    read_roles = ('admin',)
    write_roles = ()

    def get(self, request):
        return Response({'ok': True})

    def post(self, request):
        return Response({'ok': True}, status=201)


class UndeclaredResource(APIView):
    """A view that declares no roles: invisible to everyone (fail-closed)."""

    def get(self, request):
        return Response({'ok': True})

    def post(self, request):
        return Response({'ok': True}, status=201)


urlpatterns = [
    # The real session endpoints stay reachable: the CSRF contract needs
    # the cookie endpoint.
    path('api/', include('apps.accounts.urls')),
    path('crud/', CrudResource.as_view(), name='crud'),
    path('dashboard/', ReadableByReceptionResource.as_view(), name='dashboard'),
    path('respaldos/', AdminOnlyResource.as_view(), name='respaldos'),
    path('undeclared/', UndeclaredResource.as_view(), name='undeclared'),
]
