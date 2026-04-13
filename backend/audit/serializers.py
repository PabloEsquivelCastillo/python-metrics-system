from rest_framework import serializers
from .models import Bitacora


class BitacoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bitacora
        fields = [
            'bitacora_id',
            'nombre_dato',
            'tipo_movimiento',
            'accion',
            'valor_antes',
            'valor_despues',
            'fecha_hora',
            'host_origen',
            'usuario',
            'es_accion_bd',
            'usuario_bd',
        ]