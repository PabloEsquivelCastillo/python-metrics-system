from django.urls import path
from .views import UploadBatchView, PythonAnalysisListView, AnalysisDetailView

urlpatterns = [
    path('batch/upload/', UploadBatchView.as_view(), name='batch-upload'),
    path('', PythonAnalysisListView.as_view(), name='analysis-list'),
    path('<int:pk>/', AnalysisDetailView.as_view(), name='analysis-detail' )
]