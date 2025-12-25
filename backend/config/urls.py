from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from ninja import NinjaAPI
from apps.authentication.api import router as auth_router

# Disable API docs in production (only show in development)
api = NinjaAPI(
    title="My App API",
    version="1.0.0",
    description="API for my application",
    docs_url="/docs" if settings.DEBUG else None,  # Disable docs in production
)

api.add_router("/auth/", auth_router, tags=["Authentication"])


@csrf_exempt
@require_http_methods(["GET", "HEAD"])
def health_check(request):
    """Simple health check endpoint for monitoring"""
    return JsonResponse({
        "status": "healthy",
        "service": "backend"
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
    path('health/', health_check),  # Health check endpoint
]
