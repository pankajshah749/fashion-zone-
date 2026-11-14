from django.contrib import admin
from .models import Category, Product, ProductImage, ProductReview, ProductStockAlert, Address, Order, OrderItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "featured")
    list_filter = ("category", "featured")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "created_at")
    list_filter = ("rating",)
    search_fields = ("product__name", "user__username", "comment")


@admin.register(ProductStockAlert)
class ProductStockAlertAdmin(admin.ModelAdmin):
    list_display = ("product", "email", "created_at", "notified_at")
    list_filter = ("notified_at",)
    search_fields = ("product__name", "email")
    readonly_fields = ("product", "email", "created_at")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total", "discount_amount", "coupon_code", "status", "created_at")
    list_filter = ("status", "coupon_code")
    inlines = [OrderItemInline]

admin.site.register(Address)
