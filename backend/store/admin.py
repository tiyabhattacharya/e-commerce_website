from django.contrib import admin
from .models import User, Product, Cart, Order

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['mobile', 'full_name', 'created_at']
    search_fields = ['mobile', 'full_name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'price', 'sold', 'is_sale', 'created_at']
    list_filter = ['category', 'sold', 'is_sale']
    search_fields = ['title', 'description']

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__mobile', 'product__title']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'quantity', 'price', 'payment_mode', 'is_cancelled', 'created_at']
    list_filter = ['payment_mode', 'is_cancelled', 'created_at']
    search_fields = ['user__mobile', 'product__title']