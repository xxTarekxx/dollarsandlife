# backend/blog/models.py

from django.db import models

class BudgetPost(models.Model):
    title = models.CharField(max_length=200)
    imageUrl = models.URLField(max_length=500)
    content = models.TextField()
    author = models.CharField(max_length=100)
    datePosted = models.DateField()

    def __str__(self):
        return self.title


class FreelanceJob(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    date_posted = models.DateField()

    def __str__(self):
        return self.title

class MoneyMakingApp(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    link = models.URLField()

    def __str__(self):
        return self.name

class RemoteOnlineJob(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    company = models.CharField(max_length=255)
    date_posted = models.DateField()

    def __str__(self):
        return self.title

class SideHustle(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name

class DealAndSaving(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    discount_code = models.CharField(max_length=50)
    expiration_date = models.DateField()

    def __str__(self):
        return self.title
