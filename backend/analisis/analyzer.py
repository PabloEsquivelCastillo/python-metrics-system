from radon.complexity import cc_visit
from radon.metrics import mi_visit
from radon.raw import analyze
import ast
import os
import subprocess
import tempfile


def validar_archivo_python(file):
    try:
        contenido = file.read().decode('utf-8')
        ast.parse(contenido, filename=getattr(file, 'name', '<archivo>'))
        return True, None
    except UnicodeDecodeError:
        return False, 'El archivo no es texto Python valido en UTF-8.'
    except SyntaxError:
        return False, 'El contenido no corresponde a un archivo Python valido.'
    finally:
        file.seek(0)




def analizar_archivo(file):
    contenido = file.read().decode('utf-8')
    file.seek(0)

    metricas = {}
    metricas.update(_analizar_con_radon(contenido))
    metricas.update(_analizar_con_ast(contenido))
    metricas.update(_analizar_con_flake8(contenido))

    return metricas



def _analizar_con_radon(contenido):
    try:
        raw = analyze(contenido)
        bloques = cc_visit(contenido)
        complejidades = [b.complexity for b in bloques]

        return {
            'lines_of_code': raw.sloc,
            'cyclomatic_complexity': round(sum(complejidades) / len(complejidades), 1) if complejidades else 1,
            'maintainability_index': round(mi_visit(contenido, multi=True), 1),
        }

    except Exception:
        
        return {
            'lines_of_code': 0,
            'cyclomatic_complexity': 1,
            'maintainability_index': 100.0,
        }



def _analizar_con_ast(contenido):
    try:
        tree = ast.parse(contenido)

        return {
            'functions_count': sum(1 for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)),
            'classes_count': sum(1 for n in ast.walk(tree) if isinstance(n, ast.ClassDef)),
            'imports_count': sum(1 for n in ast.walk(tree) if isinstance(n, (ast.Import, ast.ImportFrom))),
        }

    except SyntaxError:
        return {
            'functions_count': 0,
            'classes_count': 0,
            'imports_count': 0,
        }



def _analizar_con_flake8(contenido):
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile( mode='w', suffix='.py', delete=False, encoding='utf-8'
        ) as tmp:
            tmp.write(contenido)
            tmp_path = tmp.name

        import sys
        flake8_path = os.path.join(os.path.dirname(sys.executable), 'flake8')
        result = subprocess.run(
            [flake8_path, tmp_path],
            capture_output=True,
            text=True
        )

        lineas = result.stdout.strip().splitlines()
        detalle = [
            f"línea {l.split(':')[-3]}:{l.split(':')[-2]} →{l.split(':')[-1]}"
            for l in lineas if l.strip()
        ]
        
        violations = len(detalle)

    except Exception:
        detalle = []
        violations = 0

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

    return {
        'pep8_violations': violations,
        'pep8_compliance': max(0, 100 - (violations * 4)),
        'pep8_detalle': detalle,
    }



def calcular_clasificacion(cyclomatic_complexity, pep8_compliance):
    # Puntaje de complejidad: 0-100
    if cyclomatic_complexity <= 5:
        score_cc = 100
    elif cyclomatic_complexity <= 10:
        score_cc = 60
    else:
        score_cc = 20

    # Promedio ponderado: 50% complejidad, 50% PEP8
    score = (score_cc * 0.5) + (pep8_compliance * 0.5)

    if score >= 70:
        return 'SIMPLE'
    elif score >= 40:
        return 'MEDIA'
    else:
        return 'COMPLEJO'


def generar_resumen(file_name, metricas, clasificacion):
    resumen = (
        f"Archivo {file_name} — "
        f"{metricas['lines_of_code']} líneas de código. "
        f"Complejidad ciclomática: {metricas['cyclomatic_complexity']} ({clasificacion}). "
        f"Índice de mantenibilidad: {metricas['maintainability_index']}/100. "
        f"Estructura: {metricas['classes_count']} clases, "
        f"{metricas['functions_count']} funciones, "
        f"{metricas['imports_count']} imports. "
        f"Violaciones PEP8: {metricas['pep8_violations']} "
        f"(cumplimiento: {metricas['pep8_compliance']}/100)."
    )

    if metricas['pep8_detalle']:
        resumen += " Detalle: " + " | ".join(metricas['pep8_detalle'])

    recomendaciones = []
    if metricas['cyclomatic_complexity'] > 10:
        recomendaciones.append(
            "Complejidad alta — considera dividir las funciones más grandes."
        )
    if metricas['pep8_violations'] > 0:
        recomendaciones.append(
            f"{metricas['pep8_violations']} violaciones PEP8 — revisa el estilo."
        )
    if metricas['maintainability_index'] < 50:
        recomendaciones.append(
            "Índice de mantenibilidad bajo — el código puede ser difícil de mantener."
        )
    if metricas['functions_count'] == 0:
        recomendaciones.append(
            "Sin funciones definidas — considera modularizar el código."
        )

    if recomendaciones:
        resumen += " Recomendaciones: " + " ".join(recomendaciones)

    return resumen