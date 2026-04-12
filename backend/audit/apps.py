from django.apps import AppConfig


class AuditConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'audit'

    def ready(self):
        """
        Al levantar el servidor, re-despliega los triggers para asegurarse
        de que siempre estén actualizados (similar a Flyway en Spring Boot).
        Solo se ejecuta si la tabla bitacora ya existe (post-migrate).
        """
        import warnings
        from django.db import connection
        from audit.triggers import deploy_triggers

        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                with connection.cursor() as cursor:
                    cursor.execute("SHOW TABLES LIKE 'bitacora';")
                    if cursor.fetchone():
                        deploy_triggers(None, connection)
        except Exception:
            pass
