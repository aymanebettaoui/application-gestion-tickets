from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    # Django admin
    path(
        "admin/",
        admin.site.urls,
    ),

    # Token authentication
    path(
        "api/token/",
        obtain_auth_token,
    ),

    # REST API
    path(
        "api/",
        include("tickets.urls"),
    ),

    # Login / logout
    path(
        "accounts/",
        include("django.contrib.auth.urls"),
    ),

    # Small HTML website
    path(
        "",
        include("tickets.web_urls"),
    ),
]