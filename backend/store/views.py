from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import login, logout
from django.db.models import Q, Sum
from .models import User, Product, Cart, Order
from .serializers import UserSerializer, ProductSerializer, CartSerializer, OrderSerializer

# Utility to always use a demo user for demo/session-less access
def get_demo_user():
    demo_user, _ = User.objects.get_or_create(
        mobile='9999999999',
        defaults={'full_name': 'Demo User'}
    )
    return demo_user

@api_view(['POST'])
@permission_classes([AllowAny])
def login_with_otp(request):
    # Always accept OTP, return demo user
    mobile = request.data.get('mobile') or '9999999999'
    full_name = request.data.get('full_name', 'Demo User')
    user, created = User.objects.get_or_create(
        mobile=mobile,
        defaults={'full_name': full_name}
    )
    if created:
        user.set_unusable_password()
        user.is_active = True
        user.save()
    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
    return Response({
        'user': UserSerializer(user).data,
        'message': 'Login successful (DEMO)'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    # Allow logout even for demo user
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    # Always return demo user data
    demo_user = get_demo_user()
    return Response(UserSerializer(demo_user).data, status=status.HTTP_200_OK)

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        sold = self.request.query_params.get('sold', None)
        if sold is not None:
            sold_bool = sold.lower() == 'true'
            queryset = queryset.filter(sold=sold_bool)
        is_sale = self.request.query_params.get('is_sale', None)
        if is_sale is not None:
            sale_bool = is_sale.lower() == 'true'
            queryset = queryset.filter(is_sale=sale_bool)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def most_bought(self, request):
        most_bought = Order.objects.filter(is_cancelled=False).values('product').annotate(
            total_quantity=Sum('quantity')
        ).order_by('-total_quantity')[:10]
        product_ids = [item['product'] for item in most_bought]
        products = Product.objects.filter(id__in=product_ids)
        products_dict = {p.id: p for p in products}
        sorted_products = [products_dict[item['product']] for item in most_bought if item['product'] in products_dict]
        serializer = ProductSerializer(sorted_products, many=True)
        return Response(serializer.data)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [AllowAny]

    def get_user(self, request):
        # Always use demo user
        return get_demo_user()

    def get_queryset(self):
        return Cart.objects.filter(user=self.get_user(self.request))

    def create(self, request):
        # Always use demo user for cart actions
        request_user = self.get_user(request)
        data = request.data.copy()
        data['user'] = request_user.id
        serializer = CartSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            cart_item = serializer.save(user=request_user)
            return Response(CartSerializer(cart_item).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def update_quantity(self, request, pk=None):
        cart_item = self.get_object()
        action_type = request.data.get('action')
        if action_type == 'increase':
            cart_item.quantity += 1
        elif action_type == 'decrease':
            cart_item.quantity -= 1
            if cart_item.quantity <= 0:
                cart_item.delete()
                return Response({'message': 'Item removed from cart'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        cart_item.save()
        serializer = CartSerializer(cart_item)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        Cart.objects.filter(user=self.get_user(request)).delete()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_204_NO_CONTENT)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]

    def get_user(self, request):
        # Always use demo user
        return get_demo_user()

    def get_queryset(self):
        return Order.objects.filter(user=self.get_user(self.request))

    def create(self, request):
        user = self.get_user(request)
        cart_items = Cart.objects.filter(user=user)
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        payment_mode = request.data.get('payment_mode', 'COD')
        orders = []
        for item in cart_items:
            order = Order.objects.create(
                user=user,
                product=item.product,
                price=item.product.price,
                quantity=item.quantity,
                payment_mode=payment_mode
            )
            orders.append(order)
        cart_items.delete()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.is_cancelled:
            return Response({'error': 'Order already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        order.is_cancelled = True
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)
