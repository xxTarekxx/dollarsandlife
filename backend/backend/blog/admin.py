from django.contrib import admin
from .models import BudgetPost

@admin.register(BudgetPost)
class BudgetPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'datePosted')
    search_fields = ('title', 'content', 'author')
