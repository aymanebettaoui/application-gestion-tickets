from rest_framework import serializers
from .models import Ticket, Category


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

        if user.role == "CLIENT":
            if self.instance:
                if "status" in attrs:
                    raise serializers.ValidationError(
                        {"status": "Clients cannot change ticket status."}
                    )

                if "assigned_to" in attrs:
                    raise serializers.ValidationError(
                        {"assigned_to": "Clients cannot assign tickets."}
                    )

        return attrs