from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, CategoryViewSet


router = DefaultRouter()

router.register("tickets", TicketViewSet)
router.register("categories", CategoryViewSet)

urlpatterns = router.urls