from django.db import models


class UploadBatch(models.Model):
    batch_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('usuarios.MiUsuario', models.DO_NOTHING)
    total_files = models.IntegerField(blank=True, null=True)
    upload_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    created_by = models.CharField(max_length=150, blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    updated_by = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'upload_batch'


class PythonAnalysis(models.Model):
    analysis_id = models.AutoField(primary_key=True)
    batch = models.ForeignKey(UploadBatch, models.DO_NOTHING)
    file_name = models.CharField(max_length=200)
    file_size_kb = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    quality_classification = models.CharField(max_length=50, blank=True, null=True)
    pep8_compliance = models.IntegerField(blank=True, null=True)
    analysis_status = models.CharField(max_length=10, blank=True, null=True)
    analysis_date = models.DateTimeField(blank=True, null=True)
    analysis_summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    created_by = models.CharField(max_length=150, blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    updated_by = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'python_analysis'


class PythonMetrics(models.Model):
    metrics_id = models.AutoField(primary_key=True)
    analysis = models.ForeignKey(PythonAnalysis, models.DO_NOTHING)
    lines_of_code = models.IntegerField(blank=True, null=True)
    cyclomatic_complexity = models.IntegerField(blank=True, null=True)
    functions_count = models.IntegerField(blank=True, null=True)
    classes_count = models.IntegerField(blank=True, null=True)
    imports_count = models.IntegerField(blank=True, null=True)
    pep8_violations = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    created_by = models.CharField(max_length=150, blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    updated_by = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'python_metrics'
