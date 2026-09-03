from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    TicketViewSet,
    CategoryViewSet,
    AgentViewSet,
    CurrentUserView,
)


router = DefaultRouter()

router.register(
    "tickets",
    TicketViewSet,
    basename="ticket"
)

router.register(
    "categories",
    CategoryViewSet
)

router.register(
    "users",
    AgentViewSet,
    basename="user"
)

urlpatterns = [
    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user"
    ),
]

urlpatterns += router.urls