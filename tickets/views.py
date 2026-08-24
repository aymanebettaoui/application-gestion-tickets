from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Ticket, Category
from .serializers import TicketSerializer, CategorySerializer
from .permissions import TicketPermission, IsAdminOrReadOnly


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [TicketPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Ticket.objects.all()

        if user.role == "AGENT":
            return Ticket.objects.filter(assigned_to=user)

        if user.role == "CLIENT":
            return Ticket.objects.filter(created_by=user)

        return Ticket.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "CLIENT":
            serializer.save(
                created_by=user,
                status="OPEN",
                assigned_to=None
            )
        else:
            serializer.save(created_by=user)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        ticket = self.get_object()

        if request.user.role != "CLIENT":
            return Response(
                {"detail": "Only clients can cancel their tickets."},
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status != "OPEN":
            return Response(
                {"detail": "Only open tickets can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = "CANCELLED"
        ticket.save()

        return Response(
            TicketSerializer(ticket).data,
            status=status.HTTP_200_OK
        )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]