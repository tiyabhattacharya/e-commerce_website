from rest_framework import serializers
from .models import User, Product, Cart, Order
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'mobile', 'full_name', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'product', 'product_id', 'quantity', 'created_at']

    def validate_product_id(self, value):
        # Ensure product exists
        if not Product.objects.filter(id=value).exists():
            raise ValidationError('Product not found.')
        return value

    def create(self, validated_data):
        """
        Create or update a cart item for the current user.
        Expects 'product_id' and 'quantity' in validated_data.
        """
        request = self.context.get('request', None)
        # Use demo user if user not authenticated (demo mode)
        user = request.user if request and request.user.is_authenticated else None
        if user is None:
            from .views import get_demo_user
            user = get_demo_user()

        product_id = validated_data.pop('product_id')
        quantity = validated_data.get('quantity', 1)
        product = get_object_or_404(Product, id=product_id)

        cart_item, created = Cart.objects.get_or_create(
            user=user,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return cart_item

class OrderSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'product', 'product_id', 'price', 'quantity', 'payment_mode', 'is_cancelled', 'created_at']
        read_only_fields = ['price', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request', None)
        user = request.user if request and request.user.is_authenticated else None
        if user is None:
            from .views import get_demo_user
            user = get_demo_user()

        product_id = validated_data.pop('product_id')
        product = get_object_or_404(Product, id=product_id)

        order = Order.objects.create(
            user=user,
            product=product,
            price=product.price,
            **validated_data
        )
        return order
