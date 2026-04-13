from django.urls import path

from .views import BitacoraListView, BitacoraDetailView


urlpatterns = [
    path('', BitacoraListView.as_view(), name='bitacora-list'),
    path('<int:pk>/', BitacoraDetailView.as_view(), name='bitacora-detail'),
]