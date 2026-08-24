from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, CategoryViewSet


router = DefaultRouter()

router.register("tickets", TicketViewSet, basename="ticket")
router.register("categories", CategoryViewSet)

urlpatterns = router.urls