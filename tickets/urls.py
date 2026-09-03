from rest_framework.routers import DefaultRouter

from .views import (
    TicketViewSet,
    CategoryViewSet,
    AgentViewSet,
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

urlpatterns = router.urls