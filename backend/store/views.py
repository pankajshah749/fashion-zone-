from django.contrib.auth.models import User
from rest_framework import generics, viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Category, Product, Address, Order
from .serializers import RegisterSerializer, CategorySerializer, ProductSerializer, AddressSerializer, OrderSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

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
    ordering_fields = ["price", "created_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        featured = self.request.query_params.get("featured")
        if category:
            qs = qs.filter(category__slug=category)
        if featured == "true":
            qs = qs.filter(featured=True)
        return qs

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
        return Order.objects.filter(user=self.request.user).order_by("-created_at")
