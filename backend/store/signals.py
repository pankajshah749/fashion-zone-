from django.db import transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Product, send_stock_alerts


@receiver(pre_save, sender=Product)
def capture_previous_stock(sender, instance, **kwargs):
    if instance.pk:
        instance._previous_stock = sender.objects.filter(pk=instance.pk).values_list("stock", flat=True).first()
    else:
        instance._previous_stock = None


@receiver(post_save, sender=Product)
def notify_product_back_in_stock(sender, instance, created, **kwargs):
    if not created and instance._previous_stock == 0 and instance.stock > 0:
        transaction.on_commit(lambda: send_stock_alerts(instance.pk))
