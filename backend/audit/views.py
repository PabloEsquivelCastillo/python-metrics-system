from rest_framework import generics
from loguru import logger
from usuarios.permissions import IsAdmin
from .models import Bitacora
from .serializers import BitacoraSerializer


class BitacoraListView(generics.ListAPIView):
    """Lista todos los registros de la bitácora. Solo administradores."""
    serializer_class = BitacoraSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = Bitacora.objects.all()

        # Filtros opcionales por query params
        nombre_dato = self.request.query_params.get('nombre_dato')
        tipo_movimiento = self.request.query_params.get('tipo_movimiento')
        usuario = self.request.query_params.get('usuario')
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')

        if nombre_dato:
            queryset = queryset.filter(nombre_dato__icontains=nombre_dato)
        if tipo_movimiento:
            queryset = queryset.filter(tipo_movimiento__iexact=tipo_movimiento)
        if usuario:
            queryset = queryset.filter(usuario__icontains=usuario)
        if fecha_desde:
            queryset = queryset.filter(fecha_hora__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_hora__lte=fecha_hasta)

        return queryset

    def list(self, request, *args, **kwargs):
        logger.debug(
            'Consulta de bitácora solicitada user_id={} email={}',
            getattr(request.user, 'id', None),
            getattr(request.user, 'email', None),
        )
        response = super().list(request, *args, **kwargs)
        logger.info(
            'Consulta de bitácora completada user_id={} status={} total={}',
            getattr(request.user, 'id', None),
            response.status_code,
            len(response.data) if isinstance(response.data, list) else None,
        )
        return response


class BitacoraDetailView(generics.RetrieveAPIView):
    """Detalle de un registro de la bitácora. Solo administradores."""
    serializer_class = BitacoraSerializer
    permission_classes = [IsAdmin]
    queryset = Bitacora.objects.all()

    def retrieve(self, request, *args, **kwargs):
        logger.debug(
            'Detalle de bitácora solicitado user_id={} bitacora_id={}',
            getattr(request.user, 'id', None),
            kwargs.get('pk'),
        )
        response = super().retrieve(request, *args, **kwargs)
        logger.info(
            'Detalle de bitácora completado user_id={} bitacora_id={} status={}',
            getattr(request.user, 'id', None),
            kwargs.get('pk'),
            response.status_code,
        )
        return response