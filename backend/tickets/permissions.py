from rest_framework.permissions import BasePermission


class TicketPermission(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):
        user = request.user

        if not user.is_authenticated:
            return False

        if user.role == "ADMIN":

            if request.method == "POST":
                return False

            return True

        if user.role == "CLIENT":
            return request.method in [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "HEAD",
                "OPTIONS",
            ]

        if user.role == "AGENT":

            if (
                request.method == "POST"
                and view.action == "messages"
            ):
                return True

            return request.method in [
                "GET",
                "PUT",
                "PATCH",
                "HEAD",
                "OPTIONS",
            ]

        return False

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):
        user = request.user

        if user.role == "ADMIN":
            return True

        if user.role == "CLIENT":

            if obj.created_by != user:
                return False

            if view.action == "cancel":
                return True

            if view.action == "messages":
                return True

            if view.action in [
                "confirm_resolution",
                "reopen",
            ]:
                return True

            if request.method in [
                "GET",
                "HEAD",
                "OPTIONS",
            ]:
                return True

            if request.method in [
                "PUT",
                "PATCH",
            ]:
                return obj.status == "OPEN"

            return False

        if user.role == "AGENT":

            if obj.assigned_to != user:
                return False

            if view.action == "messages":
                return True

            return request.method in [
                "GET",
                "PUT",
                "PATCH",
                "HEAD",
                "OPTIONS",
            ]

        return False


class IsAdminOrReadOnly(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        if request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return request.user.is_authenticated

        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )