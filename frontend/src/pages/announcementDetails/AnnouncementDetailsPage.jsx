import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import "./AnnouncementDetailsPage.css";
import Toast from "../../components/toast/Toast";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

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

const AnnouncementDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState(null);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isActionLoading, setIsActionLoading] = useState({state: false, message: ""});

  useEffect(() => {
    if (!id) return setLoading(false);
    let ignore = false;
    const preloaded = location?.state?.announcement;
    if (preloaded && String(preloaded.id) === String(id)) {
      setAnnouncement(preloaded);
      setLoading(false);
      return;
    }
    if (!id) return setLoading(false);

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/announcement/announcements/details/${id}`,
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

        if (ignore) return;

        const announcementData = data.announcement;

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
                  freelancer: announcementData.freelancer,
                  status: announcementData.status || "Open",
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

  const candidateClick = async (announcmentId) => {
    setIsActionLoading({state: true, message: "Invio della candidatura in corso"});
    try {
      const result = await fetch("/api/announcement/add-candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          announcement: announcmentId,
          candidateAddress: user.address,
        }),
      });

      if (!result.ok) throw new Error(`HTTP ${result.status}`);

      addToast("Candidatura inviata con successo", "success");
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      console.error("Errore durante la candidatura:", err);
    } finally {
      setIsActionLoading({...isActionLoading,state: false});
    }
  };

  const removeCandidateClick = async (announcmentId) => {
    setIsActionLoading({state: true, message: "Rimozione della candidatura in corso"});
    try {
      const result = await fetch("/api/announcement/delete-candidate", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          announcement: announcmentId,
          candidateAddress: user.address,
        }),
      });

      if (!result.ok) throw new Error(`HTTP ${result.status}`);

      addToast("Candidatura rimossa con successo", "success");
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      console.error("Errore durante la candidatura:", err);
    } finally {
      setIsActionLoading({...isActionLoading,state: false});
    }
  };

  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (loading)
    return(
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
          {location.state?.position === "search" && (
            <button
              className="btn primary"
              onClick={() => candidateClick(announcement.id)}
            >
              Candidati a questo progetto
            </button>
          )}
          {location.state?.position === "candidatures" && (
            <button
              className="btn primary"
              onClick={() => removeCandidateClick(announcement.id)}
            >
              Rimuovi la tua candidatura
            </button>
          )}
          <Link to={-1} className="btn ghost">
            Torna indietro
          </Link>
        </div>
      </div>
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

export default AnnouncementDetails;
