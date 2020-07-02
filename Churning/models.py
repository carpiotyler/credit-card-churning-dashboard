from django.db import models
import datetime

class Card(models.Model):
  name = models.CharField(max_length=100, unique=True)
  spend = models.IntegerField()
  date = models.DateField()

class Transaction(models.Model):
  name = models.CharField(max_length=100)
  date = models.DateField()
  value = models.IntegerField()
  card = models.ForeignKey("Card", on_delete=models.CASCADE)
