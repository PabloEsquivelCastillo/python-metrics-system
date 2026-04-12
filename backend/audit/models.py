from django.db import models

# Create your models here.
class Bitacora(models.Model):
    """
    Tabla de bitácora que registra todas las operaciones realizadas en el sistema.
    Los triggers de BD insertan aquí automáticamente.
    """
    bitacora_id = models.AutoField(primary_key=True)

    # Elementos de la bitácora
    nombre_dato = models.CharField(max_length=255, help_text='Nombre de la tabla/entidad afectada')
    tipo_movimiento = models.CharField(max_length=20, help_text='INSERT, UPDATE, DELETE')
    accion = models.CharField(max_length=255, blank=True, null=True, help_text='Descripción de la acción')
    valor_antes = models.JSONField(blank=True, null=True, help_text='JSON del estado anterior del registro')
    valor_despues = models.JSONField(blank=True, null=True, help_text='JSON del estado posterior del registro')
    fecha_hora = models.DateTimeField(auto_now_add=True)
    host_origen = models.CharField(max_length=255, blank=True, null=True, help_text='Host desde donde se originó la acción')
    usuario = models.CharField(max_length=255, blank=True, null=True, help_text='Usuario de la app (email del JWT)')

    # Campos para distinguir acciones a nivel BD vs API
    es_accion_bd = models.BooleanField(default=False, help_text='True si la acción fue directamente en BD, no vía API')
    usuario_bd = models.CharField(max_length=255, blank=True, null=True, help_text='Usuario de BD que ejecutó la acción (si no fue api_user)')

    class Meta:
        managed = True
        db_table = 'bitacora'
        ordering = ['-fecha_hora']

    def __str__(self):
        return f'{self.tipo_movimiento} en {self.nombre_dato} - {self.fecha_hora}'
