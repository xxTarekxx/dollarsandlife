from django.http import JsonResponse
from .models import BudgetPost

def budget_posts(request):
    posts = BudgetPost.objects.all()
    posts_data = [
        {
            "id": post.id,
            "title": post.title,
            "imageUrl": post.imageUrl,
            "content": post.content,
            "author": post.author,
            "datePosted": post.datePosted,
        }
        for post in posts
    ]
    return JsonResponse(posts_data, safe=False)
