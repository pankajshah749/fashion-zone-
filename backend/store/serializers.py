from decimal import Decimal

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import Category, Product, ProductImage, ProductReview, UserWallet, Address, Order, OrderItem


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    orders_count = serializers.SerializerMethodField()
    addresses_count = serializers.SerializerMethodField()
    wallet_balance = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "orders_count", "addresses_count", "wallet_balance")

    def get_orders_count(self, obj):
        return obj.orders.count()

    def get_addresses_count(self, obj):
        return obj.addresses.count()

    def get_wallet_balance(self, obj):
        return getattr(obj.wallet, "balance", 0)


class UserWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserWallet
        fields = ("balance", "updated_at")
        read_only_fields = ("updated_at",)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ProductReview
        fields = ("id", "user", "user_name", "rating", "title", "comment", "created_at")
        read_only_fields = ("id", "user", "user_name", "created_at")

    def create(self, validated_data):
        product = self.context["product"]
        user = self.context["request"].user
        review, _ = ProductReview.objects.update_or_create(
            product=product,
            user=user,
            defaults={
                "rating": validated_data.get("rating", 5),
                "title": validated_data.get("title", ""),
                "comment": validated_data.get("comment", ""),
            },
        )
        return review


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "position")


class ProductStockAlertSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    gallery = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "category", "category_name", "name", "slug", "description", "price",
            "old_price", "image", "sizes", "colors", "stock", "featured", "created_at",
            "average_rating", "review_count", "gallery"
        )

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews.exists():
            return 0
        return round(sum(review.rating for review in reviews) / reviews.count(), 1)

    def get_review_count(self, obj):
        return obj.reviews.count()


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
        read_only_fields = ("user", "total", "discount_amount")

    def create(self, validated_data):
        items = validated_data.pop("items")
        payment_method = str(validated_data.pop("payment_method", "Cash on Delivery")).strip()
        coupon_code = str(validated_data.pop("coupon_code", "")).strip().upper()
        subtotal = sum(item["product"].price * item.get("quantity", 1) for item in items)

        percent_off = {"SAVE10": 0.10, "WELCOME20": 0.20}.get(coupon_code, 0)
        flat_off = {"FREESHIP": 15}.get(coupon_code, 0)
        discount_amount = Decimal(str(subtotal)) * Decimal(str(percent_off)) + Decimal(str(flat_off))
        discount_amount = min(discount_amount, subtotal)
        total = max(subtotal - discount_amount, 0)

        user = self.context["request"].user
        wallet = UserWallet.objects.get_or_create(user=user)[0]

        if payment_method.lower() == "wallet":
            if wallet.balance < total:
                raise ValidationError("Wallet balance is insufficient for this order.")
            wallet.balance -= total
            wallet.save()

        order = Order.objects.create(
            user=user,
            total=total,
            discount_amount=discount_amount,
            coupon_code=coupon_code,
            payment_method=payment_method,
            **validated_data,
        )

        for item in items:
            product = item["product"]
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.get("quantity", 1),
                size=item.get("size", ""),
                color=item.get("color", ""),
                price=product.price,
            )
        return order
