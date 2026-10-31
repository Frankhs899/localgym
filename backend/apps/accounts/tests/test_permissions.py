"""The role enforcement contract (issue #4: S4, S6, S19, S24, S25).

The matrix (S24) is pinned per access profile and role on test-only views
(contract_urls): Socios/Membresías/Pagos are CRUD for admin and recepción
and read-only for profesor; Dashboard is read for admin and recepción;
Respaldos is admin-only; and a view that declares nothing is invisible to
everyone (fail-closed, S25). Session absence, missing permission and
missing resource all answer the same 404 (S4/S19); 403 is reserved for
CSRF failures (S5).
"""

from django.test import Client, TestCase, override_settings
from django.urls import reverse

from apps.accounts.tests.support import SpaClient, make_staff_user

CONTRACT_URLCONF = 'apps.accounts.tests.contract_urls'


@override_settings(ROOT_URLCONF=CONTRACT_URLCONF)
class PermissionMatrixTests(TestCase):
    """S6/S24: the contract for every Fase 1 access profile."""

    @classmethod
    def setUpTestData(cls):
        cls.users = {}
        for role in ('admin', 'recepcion', 'profesor'):
            user = make_staff_user(username=f'user-{role}', role=role)
            user.save()
            cls.users[role] = user

    def role_request(self, role, method, name):
        client = Client()
        if role is not None:
            client.force_login(self.users[role])
        return getattr(client, method)(reverse(f'{name}'))

    def test_the_permission_matrix_contract(self):
        cases = [
            # Socios/Membresías/Pagos: CRUD for admin and recepción,
            # read-only for profesor.
            ('crud', 'admin', 'get', 200),
            ('crud', 'admin', 'post', 201),
            ('crud', 'recepcion', 'get', 200),
            ('crud', 'recepcion', 'post', 201),
            ('crud', 'profesor', 'get', 200),
            ('crud', 'profesor', 'post', 404),
            ('crud', None, 'get', 404),
            ('crud', None, 'post', 404),
            # Dashboard: admin and recepción, reads only.
            ('dashboard', 'admin', 'get', 200),
            ('dashboard', 'recepcion', 'get', 200),
            ('dashboard', 'profesor', 'get', 404),
            ('dashboard', 'admin', 'post', 404),
            # Respaldos: admin only.
            ('respaldos', 'admin', 'get', 200),
            ('respaldos', 'recepcion', 'get', 404),
            ('respaldos', 'profesor', 'get', 404),
            # A view that declares nothing: invisible to everyone.
            ('undeclared', 'admin', 'get', 404),
            ('undeclared', 'admin', 'post', 404),
            ('undeclared', None, 'get', 404),
        ]
        for name, role, method, expected in cases:
            with self.subTest(view=name, role=role, method=method):
                response = self.role_request(role, method, name)
                self.assertEqual(response.status_code, expected)


@override_settings(ROOT_URLCONF=CONTRACT_URLCONF)
class BusinessEndpointContractTests(TestCase):
    """S4/S19: 404 for missing session or permission, 403 only for CSRF."""

    @classmethod
    def setUpTestData(cls):
        cls.profesor = make_staff_user(username='user-profesor', role='profesor')
        cls.profesor.save()
        cls.recepcion = make_staff_user(username='user-recepcion', role='recepcion')
        cls.recepcion.save()

    def setUp(self):
        # The enforced-CSRF SPA client: DRF's own CSRF check honors the
        # test client's skip flag, so a plain Client would never see 403.
        self.client = SpaClient()
        self.client.force_login(self.recepcion)
        self.client.get(reverse('accounts:auth-csrf'))
        self.token = self.client.cookies['csrftoken'].value

    def post_to_resource(self, **extra):
        return self.client.post(
            reverse('crud'),
            data='{}',
            content_type='application/json',
            **extra,
        )

    def test_the_missing_permission_404_says_no_encontrado(self):
        client = Client()
        client.force_login(self.profesor)
        response = client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['detail'], 'No encontrado.')

    def test_a_write_without_the_csrf_header_is_403(self):
        response = self.post_to_resource()
        self.assertEqual(response.status_code, 403)
        self.assertIn('CSRF', response.json()['detail'])

    def test_a_write_with_the_csrf_header_passes(self):
        response = self.post_to_resource(HTTP_X_CSRFTOKEN=self.token)
        self.assertEqual(response.status_code, 201)

    def test_an_anonymous_write_is_404_not_403(self):
        # An unauthenticated request carries no session, so it never reaches
        # the CSRF stage of the contract: it answers the same 404 (S19).
        client = Client()
        response = client.post(
            reverse('crud'), data='{}', content_type='application/json'
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn('detail', response.json())

