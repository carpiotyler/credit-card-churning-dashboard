from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from Churning.models import Card, Transaction
import datetime

class Home(View):
  def get(self, request):
    return render(request, "index.html")


class Transactions(View):
  def get(self, request):
    requestedCard = request.GET.get('cardName')
    transactions = list(Transaction.objects.filter(card__name=requestedCard).values())
    return JsonResponse({"transactions": transactions}, safe=False)

  def post(self, request):
    output = {"success": "success"}
    action = request.POST.get("action")
    if action is None:
      output = {"error": "Action not specified!"}
    elif action == "add":
      cardName = request.POST.get('cardName')
      transactionName = request.POST.get('transactionName')
      transactionAmount = request.POST.get('transactionAmount')
      transactionDate = request.POST.get('transactionDate')
      if cardName is None or cardName == "":
        output = {"error": "Card name must not be blank!"}
      elif not Card.objects.filter(name=cardName):
        output = {"error": "Transaction must be associated with a valid card!"}
      elif transactionName is None or transactionName == "":
        output = {"error": "Transaction name must not be blank!"}
      elif transactionAmount is None or transactionAmount == "" or float(transactionAmount) <= 0:
        output = {"error": "Transaction amount must be a positive number!"}
      elif transactionDate is None or transactionDate == "" or datetime.datetime.strptime(transactionDate, "%Y-%m-%d").date() is None or datetime.datetime.strptime(transactionDate, "%Y-%m-%d").date() > Card.objects.get(name=cardName).date:
        output = {"error": "Transaction date must be a valid & before card spend date!"}
      else:
        # Valid inputs
        date = datetime.datetime.strptime(transactionDate, "%Y-%m-%d").date()
        card = Card.objects.get(name=cardName)
        newTransaction = Transaction(name=transactionName, value=float(transactionAmount), date=date, card=card)
        newTransaction.save()
    elif action == "delete":
      transactionId = request.POST.get('id')
      transaction = Transaction.objects.get(id=transactionId)
      transaction.delete()
    else:
      output = {"error": "Action doesn't exist!"}
    return JsonResponse(output, safe=False)

class Cards(View):
  def get(self, request):
    requestedCard = request.GET.get('cardName')
    if requestedCard:
      # Return only the one requested card
      cards = list(Card.objects.filter(name=requestedCard).values())
    else:
      cards = list(Card.objects.all().values())
    return JsonResponse({"cards": cards}, safe=False)

  def post(self, request):
    output = {"success": "sucess"}
    action = request.POST.get('action')
    if action is None:
      output = {"error", "Action not specified!"}
    elif action == "add":
      cardName = request.POST.get('cardName')
      spendingGoal = request.POST.get('spendingGoal')
      spendingDate = request.POST.get('spendingDate')
      if cardName is None or cardName == "":
        output = {"error": "Card name must not be blank!"}
      elif Card.objects.filter(name= cardName):
        output = {"error": "Card with that name already exists!"}
      elif spendingGoal is None or spendingGoal == "" or float(spendingGoal) <= 0:
        output = {"error": "Spending goal must be a positive number!"}
      elif spendingDate is None or spendingDate == "" or datetime.datetime.strptime(spendingDate, "%Y-%m-%d").date() is None or datetime.datetime.strptime(spendingDate, "%Y-%m-%d").date() < datetime.datetime.now().date():
        output = {"error": "Spending date must be a valid & future date!"}
      else :
        # Valid inputs
        cardDate = datetime.datetime.strptime(spendingDate, "%Y-%m-%d").date()
        newCard = Card(name=cardName, spend=float(spendingGoal), date=cardDate)
        newCard.save()
    elif action == "delete":
      cardName = request.POST.get('cardName')
      existingCard = Card.objects.get(name=cardName)
      existingCard.delete()
    else:
      output = {"error": "Action doesn't exist!"}
    return JsonResponse(output, safe=False)
