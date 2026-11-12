from decimal import Decimal

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, Product, ProductReview, UserWallet, Address, Order, OrderItem
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    UserWalletSerializer,
    CategorySerializer,
    ProductSerializer,
    ProductReviewSerializer,
    AddressSerializer,
    OrderSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class WalletView(generics.GenericAPIView):
    serializer_class = UserWalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = UserWallet.objects.get_or_create(user=request.user)
        return Response(UserWalletSerializer(wallet).data)

    def post(self, request):
        wallet, _ = UserWallet.objects.get_or_create(user=request.user)
        amount = Decimal(str(request.data.get("amount", 0)))
        if amount <= 0:
            raise ValidationError("Top-up amount must be greater than zero.")
        wallet.balance += amount
        wallet.save()
        return Response(UserWalletSerializer(wallet).data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all().select_related("category")
    serializer_class = ProductSerializer
    lookup_field = "slug"
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description", "category__name"]
    ordering_fields = ["price", "created_at", "name", "featured"]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        featured = self.request.query_params.get("featured")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        in_stock = self.request.query_params.get("in_stock")
        search = self.request.query_params.get("search")

        if category:
            qs = qs.filter(category__slug=category)
        if featured == "true":
            qs = qs.filter(featured=True)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        if in_stock == "true":
            qs = qs.filter(stock__gt=0)
        if search:
            qs = qs.filter(name__icontains=search)

        if not self.request.query_params.get("ordering"):
            qs = qs.order_by("-featured", "-created_at")
        return qs

    @action(detail=True, methods=["get", "post"], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def reviews(self, request, slug=None):
        product = self.get_object()
        if request.method == "POST":
            serializer = ProductReviewSerializer(data=request.data, context={"request": request, "product": product})
            serializer.is_valid(raise_exception=True)
            review = serializer.save()
            return Response(ProductReviewSerializer(review).data, status=201)
        reviews = product.reviews.select_related("user").all()
        serializer = ProductReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related("address").prefetch_related("items__product").order_by("-created_at")
