from rest_framework.permissions import BasePermission


class TicketPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        # User must be authenticated
        if not user.is_authenticated:
            return False

        # ADMIN can do everything
        if user.role == "ADMIN":
            return True

        # CLIENT
        if user.role == "CLIENT":
            return request.method in [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "HEAD",
                "OPTIONS",
            ]

        # AGENT
        if user.role == "AGENT":
            return request.method in [
                "GET",
                "PUT",
                "PATCH",
                "HEAD",
                "OPTIONS",
            ]

        return False


    def has_object_permission(self, request, view, obj):
        user = request.user

        # ADMIN can access every ticket
        if user.role == "ADMIN":
            return True

        # CLIENT can only access their own tickets
        if user.role == "CLIENT":

            if obj.created_by != user:
                return False

            # Client can cancel their own ticket
            if view.action == "cancel":
                return True

            # Client can read their own ticket
            if request.method in [
                "GET",
                "HEAD",
                "OPTIONS",
            ]:
                return True

            # Client can edit their own ticket only while OPEN
            if request.method in [
                "PUT",
                "PATCH",
            ]:
                return obj.status == "OPEN"

            return False

        # AGENT can only access tickets assigned to them
        if user.role == "AGENT":

            if obj.assigned_to != user:
                return False

            return request.method in [
                "GET",
                "PUT",
                "PATCH",
                "HEAD",
                "OPTIONS",
            ]

        return False


class IsAdminOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        # Authenticated users can read categories
        if request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return request.user.is_authenticated

        # Only ADMIN can create/edit/delete categories
        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )