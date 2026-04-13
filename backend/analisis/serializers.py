from rest_framework import serializers
from django.utils import timezone
from .models import UploadBatch, PythonAnalysis, PythonMetrics


class UploadBatchInfoSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    def get_status(self, obj):
        analysis = self.context.get('analysis')
        if obj.status == 'PROCESSING' and analysis and analysis.analysis_status:
            return analysis.analysis_status
        return obj.status

    class Meta:
        model = UploadBatch
        fields = [
            'batch_id',
            'total_files',
            'upload_date',
            'status',
        ]




class PythonAnalysisListSerializer(serializers.ModelSerializer):
    batch = serializers.SerializerMethodField()

    def get_batch(self, obj):
        return UploadBatchInfoSerializer(obj.batch, context={'analysis': obj}).data

    class Meta:
        model  = PythonAnalysis
        fields = [
            'analysis_id',
            'batch',
            'file_name',
            'file_size_kb',
            'quality_classification',
            'pep8_compliance',
            'analysis_date',
            'analysis_status',
        ]
        
class PythonMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PythonMetrics
        fields = [
            'lines_of_code',
            'cyclomatic_complexity',
            'functions_count',
            'classes_count',
            'imports_count',
            'pep8_violations'
        ]
        
        
class AnalysisDetailSerializer(serializers.ModelSerializer):
    metrics = PythonMetricsSerializer(source='pythonmetrics_set', many=True)
    batch = serializers.SerializerMethodField()

    def get_batch(self, obj):
        return UploadBatchInfoSerializer(obj.batch, context={'analysis': obj}).data
    
    class Meta:
        model = PythonAnalysis
        fields = [
            'analysis_id',
            'batch',
            'file_name',
            'file_size_kb',
            'quality_classification',
            'pep8_compliance',
            'analysis_date',
            'analysis_status',
            'analysis_summary',
            'metrics',
        ]
class UploadBatchSerializer(serializers.ModelSerializer):

    class Meta:
        model  = UploadBatch
        fields = [
            'batch_id',
            'total_files',
            'upload_date',
            'status',
            'created_at',
            'created_by',
        ]
        read_only_fields = [
            'batch_id',
            'total_files',
            'upload_date',
            'status',
            'created_at',
            'created_by',
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        now  = timezone.now()

        return UploadBatch.objects.create(
            user        = user,
            total_files = validated_data['total_files'],
            upload_date = now,
            status      = 'PROCESSING',
            created_at  = now,
            created_by  = user.email,
            updated_at  = now,
            updated_by  = user.email,
        )


class PythonAnalysisSerializer(serializers.ModelSerializer):

    class Meta:
        model  = PythonAnalysis
        fields = [
            'analysis_id',
            'file_name',
            'file_size_kb',
            'analysis_status',
            'analysis_date',
        ]
        read_only_fields = [
            'analysis_id',
            'file_name',
            'file_size_kb',
            'analysis_status',
            'analysis_date',
        ]