from django.urls import path
from . import web_views


urlpatterns = [
    path(
        "",
        web_views.ticket_list,
        name="ticket-list",
    ),

    path(
        "tickets/create/",
        web_views.ticket_create,
        name="ticket-create",
    ),

    path(
        "tickets/<int:pk>/cancel/",
        web_views.ticket_cancel,
        name="ticket-cancel",
    ),
]