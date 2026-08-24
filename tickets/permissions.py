from rest_framework.permissions import BasePermission


class TicketPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        # Admin can do everything
        if user.role == "ADMIN":
            return True

        # Client can view, create and update
        # Object-level permission below will restrict updates
        if user.role == "CLIENT":
            return request.method in [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "HEAD",
                "OPTIONS",
            ]

        # Agent can view and update assigned tickets
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

        # Admin can do everything
        if user.role == "ADMIN":
            return True

        # Client can only interact with their own ticket
        if user.role == "CLIENT":

            if obj.created_by != user:
                return False
            if view.action == "cancel":
                return True 
            if request.method in ["GET", "HEAD", "OPTIONS"]:
                return True
            if request.method in ["PUT", "PATCH"]:
                return obj.status == "OPEN"  # Clients can only update OPEN tickets

        return False


class IsAdminOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )