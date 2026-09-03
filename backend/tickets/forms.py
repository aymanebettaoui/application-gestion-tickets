from django import forms
from django.contrib.auth import get_user_model

from .models import Ticket


class TicketForm(forms.ModelForm):
    class Meta:
        model = Ticket

        fields = [
            "title",
            "description",
            "category",
            "priority",
        ]

        widgets = {
            "title": forms.TextInput(
                attrs={
                    "placeholder": "Example: Printer not working"
                }
            ),
            "description": forms.Textarea(
                attrs={
                    "placeholder": "Describe your problem...",
                    "rows": 5,
                }
            ),
        }


class TicketAssignmentForm(forms.ModelForm):
    class Meta:
        model = Ticket
        fields = ["assigned_to"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        User = get_user_model()

        self.fields["assigned_to"].queryset = User.objects.filter(
            role="AGENT"
        )

        self.fields["assigned_to"].required = True