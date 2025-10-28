from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, mobile, full_name, password=None):
        if not mobile:
            raise ValueError('Users must have a mobile number')
        user = self.model(mobile=mobile, full_name=full_name)
        if password:
            user.set_password(password)
        else:
            # create unusable password if none provided
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, full_name, password=None):
        """
        Create and return a superuser. Password is required for superuser.
        """
        if password is None:
            raise ValueError('Superusers must have a password.')
        user = self.create_user(mobile=mobile, full_name=full_name, password=password)
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    mobile = models.CharField(max_length=15, unique=True)
    full_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'mobile'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return self.mobile

    def get_full_name(self):
        return self.full_name or self.mobile

    def get_short_name(self):
        return (self.full_name.split(' ')[0] if self.full_name else self.mobile)

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin

class Product(models.Model):
    title = models.CharField(max_length=255)
    price = models.FloatField()
    description = models.TextField()
    category = models.CharField(max_length=100)
    image_url = models.URLField()
    sold = models.BooleanField(default=False)
    is_sale = models.BooleanField(default=False)
    date_of_sale = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.mobile} - {self.product.title}"

    class Meta:
        unique_together = ('user', 'product')

class Order(models.Model):
    PAYMENT_CHOICES = [
        ('COD', 'Cash on Delivery'),
        ('ONLINE', 'Online Payment'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price = models.FloatField()
    quantity = models.IntegerField()
    payment_mode = models.CharField(max_length=10, choices=PAYMENT_CHOICES)
    is_cancelled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.mobile}"

    class Meta:
        ordering = ['-created_at']
