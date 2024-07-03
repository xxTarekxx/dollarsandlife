from django.urls import path
from .views import budget_posts

urlpatterns = [
    path('budget-posts/', budget_posts, name='budget_posts'),
]
