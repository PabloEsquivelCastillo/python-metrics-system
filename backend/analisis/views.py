from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.exceptions import ValidationError
from rest_framework.parsers  import MultiPartParser
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from loguru import logger
from .models import UploadBatch, PythonAnalysis, PythonMetrics
from .serializers import UploadBatchSerializer, PythonAnalysisSerializer, PythonAnalysisListSerializer, AnalysisDetailSerializer
from .analyzer import analizar_archivo, calcular_clasificacion, generar_resumen


class PythonAnalysisListView(generics.ListAPIView):
    serializer_class = PythonAnalysisListSerializer

    def list(self, request, *args, **kwargs):
        logger.debug(
            'Listado de analisis solicitado user_id={} email={}',
            getattr(request.user, 'id', None),
            getattr(request.user, 'email', None),
        )
        response = super().list(request, *args, **kwargs)

        data_count = None
        if isinstance(response.data, list):
            data_count = len(response.data)
        elif isinstance(response.data, dict) and isinstance(response.data.get('results'), list):
            data_count = len(response.data.get('results')) # type: ignore

        logger.info(
            'Listado de analisis completado user_id={} status={} total={}',
            getattr(request.user, 'id', None),
            response.status_code,
            data_count,
        )
        return response

    def get_queryset(self): # type: ignore
        return PythonAnalysis.objects.filter(
            batch__user=self.request.user
        ).order_by('-analysis_date')
        
class AnalysisDetailView(generics.RetrieveAPIView):
    serializer_class = AnalysisDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        logger.debug(
            'Detalle de analisis solicitado user_id={} analysis_id={}',
            getattr(request.user, 'id', None),
            kwargs.get('pk'),
        )
        response = super().retrieve(request, *args, **kwargs)
        logger.info(
            'Detalle de analisis completado user_id={} analysis_id={} status={}',
            getattr(request.user, 'id', None),
            kwargs.get('pk'),
            response.status_code,
        )
        return response
    
    def get_queryset(self): # type: ignore
        return PythonAnalysis.objects.filter(
            batch__user=self.request.user
        )


class UploadBatchView(APIView):
    parser_classes = [MultiPartParser]

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'files': {
                        'type': 'array',
                        'items': {
                            'type': 'string',
                            'format': 'binary',
                        },
                        'description': 'Uno o más archivos .py a analizar.',
                    },
                },
                'required': ['files'],
            },
        },
        responses={201: PythonAnalysisSerializer(many=True)},
        summary='Subir archivos Python para análisis',
    )
    def post(self, request):
        files = request.FILES.getlist('files')

        logger.debug(
            'Carga de lote solicitada user_id={} email={} archivos_recibidos={}',
            getattr(request.user, 'id', None),
            getattr(request.user, 'email', None),
            len(files),
        )

        if not files:
            logger.warning(
                'Carga de lote rechazada user_id={} motivo=sin_archivos',
                getattr(request.user, 'id', None),
            )
            raise ValidationError({'files': ['No se enviaron archivos.']})

        invalid = [f.name for f in files if not f.name.endswith('.py')]
        if invalid:
            logger.warning(
                'Carga de lote rechazada user_id={} total_invalidos={} archivos_invalidos={}',
                getattr(request.user, 'id', None),
                len(invalid),
                invalid,
            )
            raise ValidationError({'files': [f'Solo se permiten archivos .py. Inválidos: {invalid}']})

        # crear el batch
        batch_serializer = UploadBatchSerializer(
            data={},
            context={'request': request}
        )
        batch_serializer.is_valid(raise_exception=True)

        batch = batch_serializer.save(total_files=len(files))


        #insertar registros en PythonAnalysis
        now = timezone.now()

        registros = [
            PythonAnalysis(
                batch = batch,
                file_name = file.name,
                file_size_kb = round(file.size / 1024, 2),
                analysis_status = 'PROCESSING',
                analysis_date = now,
                created_at = now,
                created_by = request.user.email,
                updated_at = now,
                updated_by = request.user.email,
            )
            for file in files
        ]

        PythonAnalysis.objects.bulk_create(registros)

        analisis = PythonAnalysis.objects.filter(
            batch=batch
        ).order_by('analysis_id')


        #insertar en PythonMetrics
        for archivo, analysis_obj in zip(files, analisis):
            archivo.seek(0) #leer el archivo por completo nuevamente

            metricas = analizar_archivo(archivo)
            clasificacion = calcular_clasificacion(metricas['cyclomatic_complexity'], metricas['pep8_compliance'])
            resumen = generar_resumen(archivo.name, metricas, clasificacion)

            PythonMetrics.objects.create(
                analysis = analysis_obj,
                lines_of_code = metricas['lines_of_code'],
                cyclomatic_complexity = metricas['cyclomatic_complexity'],
                functions_count = metricas['functions_count'],
                classes_count = metricas['classes_count'],
                imports_count = metricas['imports_count'],
                pep8_violations = metricas['pep8_violations'],
                created_at = now,
                created_by = request.user.email,
                updated_at = now,
                updated_by = request.user.email,
            )

            # update en python_analysis
            analysis_obj.quality_classification = clasificacion
            analysis_obj.pep8_compliance = metricas['pep8_compliance']
            analysis_obj.analysis_summary = resumen
            analysis_obj.analysis_status = 'COMPLETED'
            analysis_obj.updated_at = now
            analysis_obj.updated_by = request.user.email
            analysis_obj.save()


        response = Response(
            {
                'batch': batch_serializer.data,
                'archivos': PythonAnalysisSerializer(analisis, many=True).data,
            },
            status=status.HTTP_201_CREATED
        )
        logger.info(
            'Carga de lote completada user_id={} batch_id={} total_archivos={} status={}',
            getattr(request.user, 'id', None),
            getattr(batch, 'batch_id', None),
            len(analisis),
            response.status_code,
        )
        return response