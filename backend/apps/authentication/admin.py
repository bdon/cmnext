from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, MagicLink


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser')
    search_fields = ('email',)
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )


@admin.register(MagicLink)
class MagicLinkAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'expires_at', 'used_at', 'is_valid')
    list_filter = ('created_at', 'expires_at', 'used_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('token', 'created_at')
    ordering = ('-created_at',)

    def is_valid(self, obj):
        return obj.is_valid()
    is_valid.boolean = True
