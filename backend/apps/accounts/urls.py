"""URLs for the session endpoints, mounted at /api/ by config.urls (issue #4)."""

from django.urls import path

from apps.accounts import views

app_name = 'accounts'

urlpatterns = [
    path('auth/csrf/', views.csrf_cookie, name='auth-csrf'),
    path('auth/login/', views.login_view, name='auth-login'),
    path('auth/logout/', views.logout_view, name='auth-logout'),
    path('me/', views.me, name='me'),
    path('me/password/', views.change_password, name='me-password'),
]
