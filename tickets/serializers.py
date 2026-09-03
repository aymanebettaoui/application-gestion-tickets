from rest_framework import serializers
from .models import Ticket, Category
from django.contrib.auth import get_user_model

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class TicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ticket
        fields = "__all__"

        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return attrs

        user = request.user

        # If somebody assigns a user, that user must be an AGENT
        if "assigned_to" in attrs:
            assigned_user = attrs.get("assigned_to")

            if assigned_user is not None and assigned_user.role != "AGENT":
                raise serializers.ValidationError(
                    {
                        "assigned_to":
                        "Tickets can only be assigned to an agent."
                    }
                )

        # CLIENT restrictions
        if user.role == "CLIENT" and self.instance:

            if "status" in attrs:
                raise serializers.ValidationError(
                    {
                        "status":
                        "Clients cannot change ticket status."
                    }
                )

            if "assigned_to" in attrs:
                raise serializers.ValidationError(
                    {
                        "assigned_to":
                        "Clients cannot assign tickets."
                    }
                )

        # AGENT restrictions
        if user.role == "AGENT" and self.instance:

            allowed_fields = {"status"}

            invalid_fields = set(attrs.keys()) - allowed_fields

            if invalid_fields:
                raise serializers.ValidationError(
                    "Agents can only update the ticket status."
                )

        return attrs

class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
        ]