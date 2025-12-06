from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name='index'),
    path("api/csrf/", views.get_csrf_token, name='csrf'),
    path("api/signup/", views.signup_view, name='signup'),
    path("api/login/", views.login_view, name='login'),
    path("api/logout/", views.logout_view, name='logout'),
    path("api/check-auth/", views.check_auth, name='check-auth'),
]