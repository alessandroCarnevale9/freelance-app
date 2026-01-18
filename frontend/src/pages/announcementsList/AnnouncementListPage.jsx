import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AnnouncementListPage.css";
import { useAuthContext } from "../../hooks/useAuthContext";

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const AnnouncementListPage = () => {
  const { user, token } = useAuthContext();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState({state: false, message: ""});

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user?.address) return;

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);

      try {
        if (location.state.position == "search") {
          const res = await fetch(
            `/api/announcement/announcements/${user.address}`,
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

          const data = json || [];
          setAnnouncements(data);
        } else if (location.state.position == "candidatures") {
          const res = await fetch(
            `/api/announcement/announcements/registred/${user.address}`,
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

          const data = json || [];
          setAnnouncements(data);
        } else if (location.state.position == "work") {
          const resFreelancerAnnouncements = await fetch(
            `/api/announcement/announcements/freelancer/${user.address}`,
            {
              method: "GET",
              headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              },
            }
          );

          const announcements = await resFreelancerAnnouncements.json();

          setAnnouncements(announcements);
        }
      } catch (err) {
        console.error("Errore fetch announcements:", err);
        setError(err.message || "Errore durante il recupero degli annunci");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [user?.address]);

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

      setAnnouncements((prev) => {
        return prev.filter((a) => a.id !== announcmentId);
      });
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

      setAnnouncements((prev) => {
        return prev.filter((a) => a.id !== announcmentId);
      });
    } catch (err) {
      console.error("Errore durante la candidatura:", err);
    } finally {
      setIsActionLoading({...isActionLoading,state: false});
    }
  };

  return (
    <div className="ann-list-page">
      <div className="container">
        {location.state.position === "search" && (
          <header className="list-header">
            <h1>Annunci Aperti</h1>
            <p className="muted">
              Trova opportunità di lavoro e progetti interessanti
            </p>
          </header>
        )}

        {location.state.position === "candidatures" && (
          <header className="list-header">
            <h1>Le tue candidature</h1>
            <p className="muted">
              Rivedi le tue candidature che hai inviato in precedenza
            </p>
          </header>
        )}

        {location.state.position === "work" && (
          <header className="list-header">
            <h1>Gli annunci in lavorazione</h1>
            <p className="muted">Rivedi gli annunci su cui stai lavorando</p>
          </header>
        )}

        {error && <div className="text-error">Errore: {error}</div>}

        <main className="cards-list">
          {announcements.map((a) => (
            <article key={a.id} className="announce-card">
              <div className="card-inner">
                <div className="card-main">
                  <h3 className="announce-title">{a.title}</h3>
                  <p className="announce-summary">{a.summary}</p>

                  <div className="skills-row">
                    {a.skills.map((s, i) => (
                      <span key={s + i} className="skill-pill">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="meta-row">
                    <div className="meta-left">
                      <span className="budget">ETH {a.budget}</span>
                      {a.deadline && (
                        <span className="deadline">
                          Scadenza: {formatDate(a.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-side">
                  <span
                    className={`status-badge ${
                      a.status === "Aperto" ? "open" : "closed"
                    }`}
                  >
                    {a.status === "Open" ? "Aperto" : a.status === "InProgress" ? "In lavorazione" : a.status === "InProgress_Sent" ? "Progetto conesgnato" : a.status === "Completed" ? "Completato" : a.status === "Cancelled" ? "Annullato" : a.status}
                  </span>
                  <div className="meta-actions">
                    {(location.state.position === "search" || location.state.position === "candidatures") && (
                        <Link
                          to={`/announcements-list/${a.id}`}
                          state={{
                            announcement: a,
                            position: location.state.position,
                          }}
                          className="btn small ghost"
                        >
                          Visualizza
                        </Link>
                      )}
                    {location.state.position === "work" && (
                      <Link
                          to={`/freelancer-dashboard/announcement/${a.id}`}
                          state={{
                            announcement: a,
                            position: location.state.position,
                          }}
                          className="btn small ghost"
                        >
                          Visualizza
                        </Link>
                    )}
                    {location.state.position === "search" && (
                      <button
                        className="btn small primary"
                        onClick={() => candidateClick(a.id)}
                      >
                        Candidati
                      </button>
                    )}
                    {location.state.position === "candidatures" && (
                      <button
                        className="btn small primary"
                        onClick={() => removeCandidateClick(a.id)}
                      >
                        Elimina
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}

          {!loading && announcements.length === 0 && !error && (
            <div className="muted">Nessun annuncio trovato.</div>
          )}
        </main>

        {isActionLoading.state && (
          <div className="loading-overlay">
            <div className="loading-box">
              <div className="spinner"></div>
              <div className="loading-text">{isActionLoading.message}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementListPage;
