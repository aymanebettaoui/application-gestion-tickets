from django import forms
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