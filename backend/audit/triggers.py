"""
Módulo con la lógica de creación de triggers de bitácora y auditoría.
Usado tanto por la migración 0002 como por AppConfig.ready() para
re-desplegar triggers al levantar el servidor.
"""

# ──────────────────────────────────────────────────────────────
# Tablas que tienen campos de auditoría y para las cuales se generan triggers
# ──────────────────────────────────────────────────────────────

TABLES_WITH_AUDIT = [
    {
        'table': 'upload_batch',
        'pk': 'batch_id',
        'columns': [
            'batch_id', 'user_id', 'total_files', 'upload_date', 'status',
            'created_at', 'created_by', 'updated_at', 'updated_by',
        ],
    },
    {
        'table': 'python_analysis',
        'pk': 'analysis_id',
        'columns': [
            'analysis_id', 'batch_id', 'file_name', 'file_size_kb',
            'quality_classification', 'pep8_compliance', 'analysis_status',
            'analysis_date', 'analysis_summary',
            'created_at', 'created_by', 'updated_at', 'updated_by',
        ],
    },
    {
        'table': 'python_metrics',
        'pk': 'metrics_id',
        'columns': [
            'metrics_id', 'analysis_id', 'lines_of_code', 'cyclomatic_complexity',
            'functions_count', 'classes_count', 'imports_count', 'pep8_violations',
            'created_at', 'created_by', 'updated_at', 'updated_by',
        ],
    },
    {
        'table': 'logbook',
        'pk': 'log_id',
        'columns': [
            'log_id', 'user_id', 'action', 'entity', 'details',
            'ip_address', 'action_date', 'created_at',
        ],
    },
]

USUARIO_TABLE = {
    'table': 'usuarios_miusuario',
    'pk': 'id',
    'columns': [
        'id', 'email', 'nombre_completo', 'telefono',
        'is_active', 'is_staff', 'is_superuser', 'last_login',
        'created_at', 'created_by', 'updated_at', 'updated_by',
    ],
}

ALL_TABLES = TABLES_WITH_AUDIT + [USUARIO_TABLE]

TABLES_WITH_FULL_AUDIT_FIELDS = [
    'upload_batch', 'python_analysis', 'python_metrics', 'usuarios_miusuario',
]


def _json_object_expr(prefix, columns):
    parts = []
    for col in columns:
        parts.append(f"'{col}', {prefix}.{col}")
    return 'JSON_OBJECT(' + ', '.join(parts) + ')'


def _build_drop_triggers(table):
    return [
        f"DROP TRIGGER IF EXISTS trg_{table}_after_insert;",
        f"DROP TRIGGER IF EXISTS trg_{table}_after_update;",
        f"DROP TRIGGER IF EXISTS trg_{table}_after_delete;",
        f"DROP TRIGGER IF EXISTS trg_{table}_before_insert;",
        f"DROP TRIGGER IF EXISTS trg_{table}_before_update;",
    ]


def _build_bitacora_insert_trigger(table, pk, columns):
    json_new = _json_object_expr('NEW', columns)
    return f"""
CREATE TRIGGER trg_{table}_after_insert
AFTER INSERT ON {table}
FOR EACH ROW
BEGIN
    DECLARE v_user VARCHAR(255);
    DECLARE v_es_bd TINYINT(1) DEFAULT 0;
    DECLARE v_user_bd VARCHAR(255) DEFAULT NULL;
    DECLARE v_host VARCHAR(255) DEFAULT NULL;

    IF SUBSTRING_INDEX(CURRENT_USER(), '@', 1) = 'api_user' THEN
        SET v_user = @app_user_email;
        SET v_es_bd = 0;
        SET v_host = @app_user_host;
    ELSE
        SET v_user = NULL;
        SET v_es_bd = 1;
        SET v_user_bd = CURRENT_USER();
        SET v_host = NULL;
    END IF;

    INSERT INTO bitacora (nombre_dato, tipo_movimiento, accion, valor_antes, valor_despues, fecha_hora, host_origen, usuario, es_accion_bd, usuario_bd)
    VALUES ('{table}', 'INSERT', CONCAT('INSERT en {table} PK=', NEW.{pk}), NULL, {json_new}, NOW(), v_host, v_user, v_es_bd, v_user_bd);
END;
"""


def _build_bitacora_update_trigger(table, pk, columns):
    json_old = _json_object_expr('OLD', columns)
    json_new = _json_object_expr('NEW', columns)
    return f"""
CREATE TRIGGER trg_{table}_after_update
AFTER UPDATE ON {table}
FOR EACH ROW
BEGIN
    DECLARE v_user VARCHAR(255);
    DECLARE v_es_bd TINYINT(1) DEFAULT 0;
    DECLARE v_user_bd VARCHAR(255) DEFAULT NULL;
    DECLARE v_host VARCHAR(255) DEFAULT NULL;

    IF SUBSTRING_INDEX(CURRENT_USER(), '@', 1) = 'api_user' THEN
        SET v_user = @app_user_email;
        SET v_es_bd = 0;
        SET v_host = @app_user_host;
    ELSE
        SET v_user = NULL;
        SET v_es_bd = 1;
        SET v_user_bd = CURRENT_USER();
        SET v_host = NULL;
    END IF;

    INSERT INTO bitacora (nombre_dato, tipo_movimiento, accion, valor_antes, valor_despues, fecha_hora, host_origen, usuario, es_accion_bd, usuario_bd)
    VALUES ('{table}', 'UPDATE', CONCAT('UPDATE en {table} PK=', OLD.{pk}), {json_old}, {json_new}, NOW(), v_host, v_user, v_es_bd, v_user_bd);
END;
"""


def _build_bitacora_delete_trigger(table, pk, columns):
    json_old = _json_object_expr('OLD', columns)
    return f"""
CREATE TRIGGER trg_{table}_after_delete
AFTER DELETE ON {table}
FOR EACH ROW
BEGIN
    DECLARE v_user VARCHAR(255);
    DECLARE v_es_bd TINYINT(1) DEFAULT 0;
    DECLARE v_user_bd VARCHAR(255) DEFAULT NULL;
    DECLARE v_host VARCHAR(255) DEFAULT NULL;

    IF SUBSTRING_INDEX(CURRENT_USER(), '@', 1) = 'api_user' THEN
        SET v_user = @app_user_email;
        SET v_es_bd = 0;
        SET v_host = @app_user_host;
    ELSE
        SET v_user = NULL;
        SET v_es_bd = 1;
        SET v_user_bd = CURRENT_USER();
        SET v_host = NULL;
    END IF;

    INSERT INTO bitacora (nombre_dato, tipo_movimiento, accion, valor_antes, valor_despues, fecha_hora, host_origen, usuario, es_accion_bd, usuario_bd)
    VALUES ('{table}', 'DELETE', CONCAT('DELETE en {table} PK=', OLD.{pk}), {json_old}, NULL, NOW(), v_host, v_user, v_es_bd, v_user_bd);
END;
"""


def _build_audit_before_insert(table):
    return f"""
CREATE TRIGGER trg_{table}_before_insert
BEFORE INSERT ON {table}
FOR EACH ROW
BEGIN
    DECLARE v_user VARCHAR(255);

    IF SUBSTRING_INDEX(CURRENT_USER(), '@', 1) = 'api_user' THEN
        SET v_user = COALESCE(@app_user_email, 'api_user');
    ELSE
        SET v_user = CURRENT_USER();
    END IF;

    IF NEW.created_at IS NULL THEN
        SET NEW.created_at = NOW();
    END IF;
    IF NEW.created_by IS NULL THEN
        SET NEW.created_by = v_user;
    END IF;
    SET NEW.updated_at = NOW();
    SET NEW.updated_by = v_user;
END;
"""


def _build_audit_before_update(table):
    return f"""
CREATE TRIGGER trg_{table}_before_update
BEFORE UPDATE ON {table}
FOR EACH ROW
BEGIN
    DECLARE v_user VARCHAR(255);

    IF SUBSTRING_INDEX(CURRENT_USER(), '@', 1) = 'api_user' THEN
        SET v_user = COALESCE(@app_user_email, 'api_user');
    ELSE
        SET v_user = CURRENT_USER();
    END IF;

    SET NEW.updated_at = NOW();
    SET NEW.updated_by = v_user;
END;
"""


def deploy_triggers(apps, schema_editor):
    """Crea todos los triggers (eliminando los anteriores primero)."""
    if hasattr(schema_editor, 'cursor'):
        cursor = schema_editor.cursor()
    else:
        from django.db import connection
        cursor = connection.cursor()

    for tbl in ALL_TABLES:
        for drop_sql in _build_drop_triggers(tbl['table']):
            cursor.execute(drop_sql)

    for tbl in ALL_TABLES:
        cursor.execute(_build_bitacora_insert_trigger(tbl['table'], tbl['pk'], tbl['columns']))
        cursor.execute(_build_bitacora_update_trigger(tbl['table'], tbl['pk'], tbl['columns']))
        cursor.execute(_build_bitacora_delete_trigger(tbl['table'], tbl['pk'], tbl['columns']))

    for table_name in TABLES_WITH_FULL_AUDIT_FIELDS:
        cursor.execute(_build_audit_before_insert(table_name))
        cursor.execute(_build_audit_before_update(table_name))


def rollback_triggers(apps, schema_editor):
    """Elimina todos los triggers."""
    if hasattr(schema_editor, 'cursor'):
        cursor = schema_editor.cursor()
    else:
        from django.db import connection
        cursor = connection.cursor()

    for tbl in ALL_TABLES:
        for drop_sql in _build_drop_triggers(tbl['table']):
            cursor.execute(drop_sql)
