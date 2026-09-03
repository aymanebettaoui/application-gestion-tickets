from django.contrib.auth import get_user_model

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Ticket,
    Category,
    TicketMessage,
)

from .serializers import (
    TicketSerializer,
    CategorySerializer,
    AgentSerializer,
    TicketMessageSerializer,
)

from .permissions import (
    TicketPermission,
    IsAdminOrReadOnly,
)


User = get_user_model()


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [TicketPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Ticket.objects.all()

        if user.role == "AGENT":
            return Ticket.objects.filter(
                assigned_to=user
            )

        if user.role == "CLIENT":
            return Ticket.objects.filter(
                created_by=user
            )

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
            serializer.save(
                created_by=user
            )

    @action(
        detail=True,
        methods=["post"]
    )
    def cancel(self, request, pk=None):
        ticket = self.get_object()

        if request.user.role != "CLIENT":
            return Response(
                {
                    "detail":
                    "Only clients can cancel their tickets."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status != "OPEN":
            return Response(
                {
                    "detail":
                    "Only open tickets can be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = "CANCELLED"
        ticket.save()

        return Response(
            TicketSerializer(ticket).data,
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["patch"]
    )
    def assign(self, request, pk=None):
        if request.user.role != "ADMIN":
            return Response(
                {
                    "detail":
                    "Only administrators can assign tickets."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        ticket = self.get_object()

        agent_id = request.data.get(
            "assigned_to"
        )

        if not agent_id:
            ticket.assigned_to = None

        else:
            agent = User.objects.filter(
                pk=agent_id,
                role="AGENT"
            ).first()

            if agent is None:
                return Response(
                    {
                        "assigned_to":
                        "Select a valid agent."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            ticket.assigned_to = agent

        ticket.save(
            update_fields=[
                "assigned_to",
                "updated_at",
            ]
        )

        return Response(
            TicketSerializer(ticket).data,
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["patch"]
    )
    def update_status(self, request, pk=None):
        if request.user.role != "AGENT":
            return Response(
                {
                    "detail":
                    "Only agents can update ticket status."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        ticket = self.get_object()

        new_status = request.data.get(
            "status"
        )

        allowed_transitions = {
            "OPEN": "IN_PROGRESS",
            "IN_PROGRESS": "RESOLVED",
        }

        expected_status = allowed_transitions.get(
            ticket.status
        )

        if new_status != expected_status:
            return Response(
                {
                    "detail":
                    "This status change is not allowed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = new_status
        ticket.save()

        return Response(
            TicketSerializer(ticket).data,
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["get", "post"]
    )
    def messages(self, request, pk=None):
        ticket = self.get_object()

        if request.method == "GET":

            messages = (
                TicketMessage.objects
                .filter(ticket=ticket)
                .select_related("sender")
                .order_by("created_at")
            )

            serializer = TicketMessageSerializer(
                messages,
                many=True
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        if request.user.role not in [
            "CLIENT",
            "AGENT",
        ]:
            return Response(
                {
                    "detail":
                    "Only the client and assigned agent can send messages."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status in [
            "CLOSED",
            "CANCELLED",
        ]:
            return Response(
                {
                    "detail":
                    "Messages cannot be sent on a closed or cancelled ticket."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        content = request.data.get(
            "content",
            ""
        ).strip()

        if not content:
            return Response(
                {
                    "content":
                    "Message cannot be empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        message = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            content=content
        )

        serializer = TicketMessageSerializer(
            message
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(
        detail=True,
        methods=["patch"]
    )
    def confirm_resolution(
        self,
        request,
        pk=None
    ):
        ticket = self.get_object()

        if request.user.role != "CLIENT":
            return Response(
                {
                    "detail":
                    "Only the client can confirm resolution."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status != "RESOLVED":
            return Response(
                {
                    "detail":
                    "Only resolved tickets can be closed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = "CLOSED"
        ticket.save()

        return Response(
            TicketSerializer(ticket).data,
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["patch"]
    )
    def reopen(self, request, pk=None):
        ticket = self.get_object()

        if request.user.role != "CLIENT":
            return Response(
                {
                    "detail":
                    "Only the client can reopen a ticket."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if ticket.status != "RESOLVED":
            return Response(
                {
                    "detail":
                    "Only resolved tickets can be reopened."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = "IN_PROGRESS"
        ticket.save()

        return Response(
            TicketSerializer(ticket).data,
            status=status.HTTP_200_OK
        )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [
        IsAdminOrReadOnly
    ]


class AgentViewSet(
    viewsets.ReadOnlyModelViewSet
):
    serializer_class = AgentSerializer
    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):
        if self.request.user.role == "ADMIN":
            return User.objects.filter(
                role="AGENT"
            )

        return User.objects.none()


class CurrentUserView(APIView):
    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "role": request.user.role,
        })