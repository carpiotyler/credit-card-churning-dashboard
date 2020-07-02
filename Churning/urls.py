from django.conf.urls import url
from django.contrib import admin
from django.urls import path
from Churning import views

urlpatterns = [
  url(r'^admin/', admin.site.urls),
  path('', views.Home.as_view()),
  path('cards', views.Cards.as_view()),
  path('transactions', views.Transactions.as_view())
]
