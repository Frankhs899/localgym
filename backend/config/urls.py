"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, re_path

from config import views

urlpatterns = [
    path('admin/', admin.site.urls),
    # D3 (issue #3): the SPA catch-all must stay LAST. Fase 1 API routes
    # (e.g. path('api/', include(...))) will be inserted above it.
    re_path(r'^', views.spa, name='spa'),
]
