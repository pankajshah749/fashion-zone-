from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Product, Address, Order, OrderItem

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    class Meta:
        model = Product
        fields = "__all__"

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = "__all__"
        read_only_fields = ("user",)

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)
    class Meta:
        model = OrderItem
        fields = "__all__"
        read_only_fields = ("order", "price")

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ("user", "total")

    def create(self, validated_data):
        items = validated_data.pop("items")
        total = sum(item["product"].price * item.get("quantity", 1) for item in items)
        order = Order.objects.create(
            user=self.context["request"].user, total=total, **validated_data
        )
        for item in items:
            product = item["product"]
            OrderItem.objects.create(
                order=order, product=product, quantity=item.get("quantity", 1),
                size=item.get("size", ""), color=item.get("color", ""),
                price=product.price
            )
        return order
