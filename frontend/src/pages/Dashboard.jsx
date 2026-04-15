import { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  FiUploadCloud,
  FiFolder,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import Swal from "sweetalert2";
import api from "../api/axios";
import AnalysisModal from "../components/AnalysisModal";
import ApiSpinner from "../components/ApiSpinner";

function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(1);
  const [expandedBatches, setExpandedBatches] = useState({});
  const perPage = 8;

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/analysis/");
      setAnalyses(data);
    } catch {
      /* handled by interceptor */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const handleUpload = async (e) => {
    const files = e.target.files;

    if (!files.length) return;

    if (files.length > 10) {
      Swal.fire({
        icon: "warning",
        title: "Demasiados archivos",
        text: "Solo puedes subir hasta 10 archivos.",
        confirmButtonColor: "#2C89F5",
      });
      e.target.value = "";
      return;
    }

    const invalid = Array.from(files).filter((f) => !f.name.endsWith(".py"));
    if (invalid.length) {
      Swal.fire({
        icon: "warning",
        title: "Archivos inválidos",
        text: "Solo se permiten archivos .py",
        confirmButtonColor: "#2C89F5",
      });
      return;
    }

    const MAX_SIZE = 2 * 1024;
    const oversized = Array.from(files).filter((f) => f.size > MAX_SIZE);

    if (oversized.length) {
      Swal.fire({
        icon: "warning",
        title: "Archivo demasiado grande",
        text: "Cada archivo debe ser menor o igual a 2 KB.",
        confirmButtonColor: "#2C89F5",
      });
      e.target.value = "";
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Analizar archivos?",
      text: `Se analizarán ${files.length} archivo(s).`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2C89F5",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, analizar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) {
      e.target.value = "";
      return;
    }

    setUploading(true);
    const uploadStartAt = Date.now();
    let spinnerRoot = null;
    Swal.fire({
      html: '<div id="swal-api-spinner-root"></div>',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: (popup) => {
        const mountPoint = popup.querySelector("#swal-api-spinner-root");
        if (!mountPoint) return;
        spinnerRoot = createRoot(mountPoint);
        spinnerRoot.render(
          <ApiSpinner mode="panel" title="Cargando..." subtitle="" compact />,
        );
      },
      willClose: () => {
        if (spinnerRoot) {
          spinnerRoot.unmount();
          spinnerRoot = null;
        }
      },
    });

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
      await api.post("/analysis/batch/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchAnalyses();
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "¡Análisis completo!",
        text: `${files.length} archivo(s) procesado(s) correctamente.`,
        confirmButtonColor: "#2C89F5",
      });
    } catch (err) {
      const msg =
        err.response?.data?.details?.files?.[0] ||
        err.response?.data?.message ||
        "Error al subir archivos.";
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        confirmButtonColor: "#2C89F5",
      });
    } finally {
      const elapsed = Date.now() - uploadStartAt;
      const minVisibleMs = 650;
      if (elapsed < minVisibleMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, minVisibleMs - elapsed),
        );
      }
      setUploading(false);
      e.target.value = "";
    }
  };

  const qualityBadge = (q) => {
    const config = {
      SIMPLE: { bg: "rgba(0,196,140,0.12)", color: "#00a676" },
      MEDIA: { bg: "rgba(255,184,0,0.12)", color: "#cc9300" },
      COMPLEJO: { bg: "rgba(255,59,59,0.12)", color: "#dc2626" },
    };
    const c = config[q] || { bg: "#f0f0f0", color: "#999" };
    return (
      <span className="badge" style={{ background: c.bg, color: c.color }}>
        {q}
      </span>
    );
  };

  const pep8Bar = (val) => {
    const pct = val ?? 0;
    let color = "#FF3B3B";
    if (pct >= 90) {
      color = "#00C48C";
    } else if (pct >= 70) {
      color = "#FFB800";
    }
    return (
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: 70,
            height: 7,
            background: "#e9ecef",
            borderRadius: 10,
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: color,
              borderRadius: 10,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <small style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>
          {pct}%
        </small>
      </div>
    );
  };

  const formatBatchStatus = (status) => {
    const labels = {
      COMPLETED: "Completado",
      PROCESSING: "Procesando",
      FAILED: "Fallido",
    };

    return labels[status] || status || "—";
  };

  const groupedBatches = analyses.reduce((acc, analysis) => {
    const batchId = analysis.batch?.batch_id ?? analysis.analysis_id;

    if (!acc[batchId]) {
      acc[batchId] = {
        batch: analysis.batch || {
          batch_id: analysis.analysis_id,
          total_files: 1,
          upload_date: analysis.analysis_date,
          status: analysis.analysis_status,
        },
        analyses: [],
      };
    }

    acc[batchId].analyses.push(analysis);
    return acc;
  }, {});

  const batchGroups = Object.values(groupedBatches).sort((left, right) => {
    const leftDate = new Date(
      left.batch?.upload_date || left.analyses[0]?.analysis_date || 0,
    ).getTime();
    const rightDate = new Date(
      right.batch?.upload_date || right.analyses[0]?.analysis_date || 0,
    ).getTime();
    return rightDate - leftDate;
  });

  const toggleBatch = (batchId) => {
    setExpandedBatches((current) => ({
      ...current,
      [batchId]: !(current[batchId] ?? false),
    }));
  };

  const isBatchExpanded = (batchId) => expandedBatches[batchId] ?? false;

  // Paginación
  const totalPages = Math.ceil(batchGroups.length / perPage);
  const paginated = batchGroups.slice((page - 1) * perPage, page * perPage);
  const hasExpandedBatchInPage = paginated.some(
    ({ batch, analyses: batchAnalyses }) => {
      const batchId = batch?.batch_id ?? batchAnalyses[0]?.analysis_id;
      return isBatchExpanded(batchId);
    },
  );

  const renderBatchRows = ({ batch, analyses: batchAnalyses }) => {
    const batchId = batch?.batch_id ?? batchAnalyses[0]?.analysis_id;
    const expanded = isBatchExpanded(batchId);
    const totalFiles = batch?.total_files ?? batchAnalyses.length;
    const uploadDate = batch?.upload_date || batchAnalyses[0]?.analysis_date;
    const batchLabel = uploadDate
      ? `Carga del ${new Date(uploadDate).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}`
      : "Carga sin fecha registrada";

    const fileRows = expanded
      ? batchAnalyses.map((a) => (
          <tr key={a.analysis_id}>
            <td style={{ paddingLeft: 44, fontWeight: 500 }}>
              <i
                className="bi bi-file-earmark-code me-2"
                style={{ color: "#2C89F5" }}
              ></i>
              {a.file_name}
            </td>
            <td
              className="d-none d-md-table-cell"
              style={{ color: "#6b7280" }}
            >
              {a.analysis_date
                ? new Date(a.analysis_date).toLocaleDateString("es-MX")
                : "—"}
            </td>
            <td>{qualityBadge(a.quality_classification)}</td>
            <td className="d-none d-sm-table-cell">{pep8Bar(a.pep8_compliance)}</td>
            <td
              className="d-none d-lg-table-cell"
              style={{ color: "#6b7280", fontSize: 13 }}
            >
              {a.file_size_kb} KB
            </td>
            <td>
              <button
                className="btn btn-sm"
                onClick={() => setSelectedId(a.analysis_id)}
                style={{
                  background: "rgba(44,137,245,0.08)",
                  color: "#2C89F5",
                  borderRadius: 10,
                  fontWeight: 500,
                  fontSize: 13,
                }}
              >
                Ver resumen
              </button>
            </td>
          </tr>
        ))
      : [];

    return [
      <tr
        key={`batch-${batchId}`}
        style={{ background: "rgba(44,137,245,0.04)" }}
      >
        <td colSpan={6} style={{ padding: "14px 24px" }}>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <button
              type="button"
              className="btn p-0 d-inline-flex align-items-center gap-2"
              onClick={() => toggleBatch(batchId)}
              style={{
                color: "#1f2937",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              {expanded ? (
                <FiChevronDown size={16} />
              ) : (
                <FiChevronRight size={16} />
              )}
              <FiFolder size={18} color="#2C89F5" />
              <span>{batchLabel}</span>
            </button>

            <div
              className="d-flex flex-wrap gap-3"
              style={{ color: "#6b7280", fontSize: 13 }}
            >
              <span>{totalFiles} archivo(s)</span>
              <span>Estado: {formatBatchStatus(batch?.status)}</span>
            </div>
          </div>
        </td>
      </tr>,
      ...fileRows,
    ];
  };

  let tableRows = paginated.flatMap(renderBatchRows);
  if (loading) {
    tableRows = [
      <tr key="loading">
        <td colSpan={6} className="text-center py-5 text-muted">
          <ApiSpinner
            mode="panel"
            title="Cargando análisis"
            subtitle="Estamos consultando los archivos ya procesados."
            compact
          />
        </td>
      </tr>,
    ];
  } else if (paginated.length === 0) {
    tableRows = [
      <tr key="empty">
        <td colSpan={6} className="text-center py-5">
          <FiUploadCloud size={40} color="#ccc" />
          <p className="text-muted mt-2 mb-0">
            No hay análisis aún. Sube archivos .py para comenzar.
          </p>
        </td>
      </tr>,
    ];
  }

  return (
    <div className="container-fluid px-4 py-4 fade-in-up">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-white mb-0">Archivos cargados</h2>
          <p
            className="mb-0"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}
          >
            Tus archivos analizados y calificados
          </p>
        </div>
        <label
          className="btn d-flex align-items-center gap-2"
          style={{
            background: "white",
            color: "#2C89F5",
            fontWeight: 600,
            cursor: "pointer",
            borderRadius: 14,
            padding: "10px 20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <FiUploadCloud size={20} />
          {uploading ? (
            <ApiSpinner mode="inline" title="Analizando..." />
          ) : (
            "Analizar archivos"
          )}
          <input
            type="file"
            multiple
            accept=".py"
            hidden
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <div
        className="card p-0 overflow-hidden"
        style={{ position: "relative" }}
      >
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            {hasExpandedBatchInPage && (
              <thead className="table-light">
                <tr>
                  <th style={{ paddingLeft: 24 }}>Archivo</th>
                  <th className="d-none d-md-table-cell">Fecha</th>
                  <th>Calidad</th>
                  <th className="d-none d-sm-table-cell">PEP8</th>
                  <th className="d-none d-lg-table-cell">Tamaño</th>
                  <th>Acción</th>
                </tr>
              </thead>
            )}
            <tbody>{tableRows}</tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            className="d-flex justify-content-center align-items-center gap-1 py-3"
            style={{ borderTop: "1px solid #f0f0f0" }}
          >
            <button
              className="btn btn-sm"
              disabled={page === 1}
              onClick={() => setPage(1)}
              style={{
                background: "transparent",
                color: "#6b7280",
                fontSize: 13,
              }}
            >
              &laquo;
            </button>
            <button
              className="btn btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              style={{
                background: "transparent",
                color: "#6b7280",
                fontSize: 13,
              }}
            >
              &lsaquo; Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  className="btn btn-sm"
                  style={
                    page === p
                      ? {
                          background: "#2C89F5",
                          color: "white",
                          borderRadius: 10,
                          minWidth: 36,
                        }
                      : {
                          background: "transparent",
                          color: "#6b7280",
                          borderRadius: 10,
                          minWidth: 36,
                        }
                  }
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button
              className="btn btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{
                background: "transparent",
                color: "#6b7280",
                fontSize: 13,
              }}
            >
              Siguiente &rsaquo;
            </button>
            <button
              className="btn btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
              style={{
                background: "transparent",
                color: "#6b7280",
                fontSize: 13,
              }}
            >
              &raquo;
            </button>
          </div>
        )}
      </div>

      {selectedId && (
        <AnalysisModal
          analysisId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
