import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "./AnnouncementReviewFreelancerPage.css";
import Toast from "../../components/toast/Toast";
import { useAuthContext } from "../../hooks/useAuthContext";

import { UploadIcon } from "@icons";

const formatDate = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  // If it's already a Date object
  if (value instanceof Date && !isNaN(value)) {
    return value.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // If it's a numeric-like string or number, normalize to milliseconds
  const str = String(value).trim();
  if (/^\d+$/.test(str)) {
    let ts = Number(str);
    // heuristic: if timestamp looks like seconds (<= 1e12) convert to ms
    if (ts < 1e12) ts = ts * 1000;
    return new Date(ts).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // Try parsing ISO / readable date string
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return new Date(parsed).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // Fallback: return raw string
  return str;
};

const AnnouncementReviewFreelancerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState(null);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState("");
  const [statusLabel, setStatusLabel] = useState("");
  const [projectName, setProjectName] = useState("");

  const [workFile, setWorkFile] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState({state: false, message: ""});

  useEffect(() => {
    // const preloaded = location?.state?.announcement;
    // if (preloaded && String(preloaded.id) === String(id)) {
    //   setAnnouncement(preloaded);
    //   setLoading(false);
    //   return;
    // }
    if (!id) return setLoading(false);

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/announcement/announcements/freelancer-details/${id}`,
          {
            method: "GET",
            headers: { 
              "Content-Type": "application/json",
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.errors)
          throw new Error(json.errors.map((e) => e.message).join(", "));
        const data = json;
        if (!data) throw new Error("Annuncio non trovato");

        const formattedCandidates = data.candidates.map((c) => {
          return {
            id: c.address,
            name: c.nickname || "",
            projects: c.projects.length || 0,
            skills: c.keySkills || [],
          };
        });

        setCandidates(formattedCandidates);
        const announcementData = data.announcement;
        let labelFromStatus = "";
        switch (announcementData.status) {
          case "Open":
            labelFromStatus = "In ricerca del candidato";
            break;
          case "InProgress_Sent":
            labelFromStatus = "Progetto consegnato";
            break;
          case "InProgress":
            labelFromStatus = "In lavorazione";
            break;
          case "Presentation":
            labelFromStatus = "Richiesta di presentazione";
            break;
          case "Completed":
            labelFromStatus = "Completato";
            break;
          case "Cancelled":
            labelFromStatus = "Annullato";
            break;
        }

        setStatus(announcementData.status);
        setStatusLabel(labelFromStatus);

        setAnnouncement({
          id: announcementData.id,
          title: announcementData.title || `Annuncio #${announcementData.id}`,
          summary: announcementData.summary || "",
          skills: announcementData.skills || [],
          requirements: announcementData.requirements || [],
          budget:
            announcementData.budget != null
              ? String(announcementData.budget).includes(".")
                ? announcementData.budget
                : ethers.utils.formatEther(announcementData.budget)
              : "—",
          deadline: announcementData.deadline || null,
          createdAt: announcementData.createdAt || null,
        });
      } catch (err) {
        console.error("fetch announcement error", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return setLoading(false);

    const fetchProjectName = async () => {
      try {
        if (status == "InProgress_Sent" || status == "Presentation") {
          const res = await fetch(
            `/api/announcement/announcements/project-name/${id}`,
            {
              method: "GET",
              headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              },
            }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (json.errors)
            throw new Error(json.errors.map((e) => e.message).join(", "));
          const data = json;

          setProjectName(data.workFileId);
        }
      } catch (err) {
        setError(err.message || String(err));
      }
    };

    fetchProjectName();
  }, [status]);

  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setWorkFile(e.target.files[0]);
    }
  };

  const handleWorkSubmission = async (e) => {
    e.preventDefault();
    if (!workFile) {
      addToast("Per favore, seleziona un file da caricare.", "error");
      return;
    }

    setIsActionLoading({state: true, message: "Invio del lavoro in corso"});

    try {
      const formData = new FormData();
      const payload = { announcementId: id };

      formData.append("data", JSON.stringify(payload));

      formData.append(workFile.name, workFile);

      const response = await fetch("/api/announcement/announcements/freelancer/project-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error || errData.message || "Errore durante la registrazione"
        );
      }

      setStatus("InProgress_Sent");
      setStatusLabel("Progetto consegnato");
    } catch (err) {
      console.error("Errore durante la presentazione del lavoro:", err);
      addToast(
        err.message || "Errore durante la presentazione del lavoro",
        "error"
      );
    } finally {
      setIsActionLoading({...isActionLoading, state: false});
    }
  };

  const handleDeleteWork = async () => {
    setIsActionLoading({state: true, message: "Eliminazione del file in corso"});
    try {
      const response = await fetch(
        `/api/announcement/announcements/project-delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error ||
            errData.message ||
            "Errore durante l'eliminazione del file"
        );
      }

      addToast("File eliminato con successo", "success");
      setStatus("InProgress");
      setStatusLabel("In lavorazione");
      setProjectName("");
    } catch (err) {
      console.error("Errore durante l'eliminazione del file:", err);
      addToast(
        err.message || "Errore durante l'eliminazione del file",
        "error"
      );
    } finally {
      setIsActionLoading({...isActionLoading, state: false});
    }
  };

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="loading-box">
          <div className="spinner"></div>
          <div className="loading-text">Caricamento</div>
        </div>
      </div>
    );
  if (error)
    return <div className="announce-details-page">Errore: {error}</div>;
  if (!announcement)
    return <div className="announce-details-page">Annuncio non trovato</div>;

  return (
    <div className="announce-details-page">
      <div className="details-card">
        <header className="details-header">
          <div className="announce-status">
            <span
              className={`status-pill ${String(status || "").toLowerCase()}`}
            >
              {statusLabel || "Aperto"}
            </span>
          </div>
          <h1 className="details-title">{announcement.title}</h1>
          <div className="client-name">{announcement.client}</div>
        </header>

        <div className="meta-row">
          <div className="meta-box">
            <div className="meta-label">Budget</div>
            <div className="meta-value">ETH {announcement.budget}</div>
          </div>

          <div className="meta-box">
            <div className="meta-label">Deadline</div>
            <div className="meta-value">
              {formatDate(announcement.deadline)}
            </div>
          </div>

          <div className="meta-box">
            <div className="meta-label">Pubblicato</div>
            <div className="meta-value">
              {formatDate(announcement.createdAt)}
            </div>
          </div>
        </div>

        <section className="section">
          <h3>Descrizione</h3>
          <p className="description">
            {announcement.summary || "Nessuna descrizione disponibile."}
          </p>
        </section>

        <section className="section">
          <h3>Competenze richieste</h3>
          <div className="skills-list">
            {announcement.skills.length > 0 ? (
              announcement.skills.map((s, i) => (
                <span key={s + i} className="skill-pill">
                  {s}
                </span>
              ))
            ) : (
              <div className="muted">Nessuna skill specificata.</div>
            )}
          </div>
        </section>

        <section className="section">
          <h3>
            <span className="check-icon">✔︎</span> Requisiti di completamento
          </h3>
          <div className="muted small">
            Tutti i requisiti devono essere completati per considerare il
            progetto concluso.
          </div>

          <ol className="requirements-list">
            {announcement.requirements.length > 0 ? (
              announcement.requirements.map((req, i) => (
                <li key={i} className="requirement-item">
                  <span className="req-badge">{i + 1}</span>
                  <span className="req-text">{req.requirement}</span>
                  {req.done && (
                    <span className="req-completed-badge">Completato</span>
                  )}
                </li>
              ))
            ) : (
              <li className="requirement-item muted">
                Nessun requisito specificato.
              </li>
            )}
          </ol>
        </section>

        <div className="details-footer">
          <Link to={-1} className="btn ghost">
            Torna indietro
          </Link>
        </div>
      </div>

      {status === "InProgress" && (
        <div className="details-card" style={{ marginTop: "20px" }}>
          <section className="section">
            <h3>Consegna il lavoro</h3>
            <p className="muted small">
              Carica il tuo lavoro per la revisione del cliente. Una volta
              approvato, il pagamento verrà sbloccato.
            </p>
            <form
              onSubmit={handleWorkSubmission}
              className="work-submission-form"
            >
              <div className="form-group">
                <label htmlFor="work-file" className="file-upload-label">
                  <span className="upload-icon" role="img" aria-label="upload">
                    <UploadIcon width={18} height={18} />
                  </span>
                  {workFile ? (
                    <span className="file-name">{workFile.name}</span>
                  ) : (
                    <span>Scegli un file...</span>
                  )}
                </label>
                <input
                  type="file"
                  id="work-file"
                  onChange={handleFileChange}
                  disabled={isActionLoading.state}
                />
              </div>
              <button
                type="submit"
                className="btn primary"
                disabled={!workFile || isActionLoading.state}
              >
                {isActionLoading.state ? "Invio in corso..." : "Invia per revisione"}
              </button>
            </form>
          </section>
        </div>
      )}

      {status === "InProgress_Sent" && (
        <div className="details-card" style={{ marginTop: "20px" }}>
          <section className="section">
            <h3>Lavoro consegnato</h3>
            <p className="muted small">
              Hai caricato il seguente file per la revisione.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <div className="file-upload-label" style={{ cursor: "default" }}>
                <span className="file-name">{projectName}</span>
              </div>
              <button
                className="btn primary"
                style={{ backgroundColor: "#c23a2b", border: "none" }}
                onClick={handleDeleteWork}
              >
                Elimina
              </button>
            </div>
          </section>
        </div>
      )}

      {status === "Presentation" && (
        <div className="details-card" style={{ marginTop: "20px" }}>
          <section className="section">
            <h3>Lavoro consegnato</h3>
            <p className="muted small">
              Hai caricato il seguente file per la revisione.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <div className="file-upload-label" style={{ cursor: "default" }}>
                <span className="file-name">{projectName}</span>
              </div>
              <button
                className="btn primary"
                onClick={async () => {
                  try {
                    const url = `/api/announcement/project-download/${id}/${projectName}`;

                    const response = await fetch(url, {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                      },
                    });

                    if (!response.ok) {
                      throw new Error("Errore durante il download del file");
                    }

                    const cd = response.headers.get('content-disposition') || '';
                    const match = /filename\*?=(?:UTF-8''?)?"?([^;"]+)"?/.exec(cd);
                    const filename = match ? decodeURIComponent(match[1]) : projectName;  

                    const blob = await response.blob();


                    const downloadUrl = window.URL.createObjectURL(blob);


                    const link = document.createElement("a");
                    link.href = downloadUrl;

                    link.download = filename;
                    

                    document.body.appendChild(link);
                    link.click();


                    link.remove();
                    window.URL.revokeObjectURL(downloadUrl);
                  } catch (error) {
                    console.error("Download fallito:", error);
                  }
                }}
              >
                Scarica
              </button>
            </div>
          </section>
        </div>
      )}

      {/* <button onClick={() => {
        window.location.href = `/api/announcement/project-download/SAD`;
      }}>
        Download
      </button> */}

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {isActionLoading.state && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <div className="loading-text">{isActionLoading.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementReviewFreelancerPage;
