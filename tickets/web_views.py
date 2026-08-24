from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST

from .models import Ticket
from .forms import TicketForm


@login_required
def ticket_list(request):
    user = request.user

    if user.role == "ADMIN":
        tickets = Ticket.objects.all()

    elif user.role == "AGENT":
        tickets = Ticket.objects.filter(
            assigned_to=user
        )

    else:
        tickets = Ticket.objects.filter(
            created_by=user
        )

    tickets = tickets.order_by("-created_at")

    context = {
        "tickets": tickets,
        "total_count": tickets.count(),
        "open_count": tickets.filter(status="OPEN").count(),
        "progress_count": tickets.filter(
            status="IN_PROGRESS"
        ).count(),
        "resolved_count": tickets.filter(
            status="RESOLVED"
        ).count(),
    }

    return render(
        request,
        "tickets/ticket_list.html",
        context,
    )


@login_required
def ticket_create(request):

    if request.user.role == "AGENT":
        return HttpResponseForbidden(
            "Agents cannot create tickets."
        )

    if request.method == "POST":
        form = TicketForm(request.POST)

        if form.is_valid():
            ticket = form.save(commit=False)

            ticket.created_by = request.user
            ticket.status = "OPEN"
            ticket.assigned_to = None

            ticket.save()

            messages.success(
                request,
                "Ticket created successfully."
            )

            return redirect("ticket-list")

    else:
        form = TicketForm()

    return render(
        request,
        "tickets/ticket_create.html",
        {"form": form},
    )


@login_required
@require_POST
def ticket_cancel(request, pk):

    if request.user.role != "CLIENT":
        return HttpResponseForbidden(
            "Only clients can cancel tickets."
        )

    ticket = get_object_or_404(
        Ticket,
        pk=pk,
        created_by=request.user,
    )

    if ticket.status == "OPEN":

        ticket.status = "CANCELLED"
        ticket.save()

        messages.success(
            request,
            "Ticket cancelled successfully."
        )

    else:

        messages.error(
            request,
            "Only open tickets can be cancelled."
        )

    return redirect("ticket-list")