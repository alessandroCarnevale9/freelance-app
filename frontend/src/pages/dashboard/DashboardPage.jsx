import "./DashboardPage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { ethers } from "ethers";
import { ChevronRightIcon } from "../../icons";

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

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    presentation: 0,
    completed: 0,
  });

  // Usiamo i dati mockati come stato iniziale
  const [announcements, setAnnouncements] = useState([]);

  // --- STATO PAGINAZIONE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const resFreelancerAnnouncements = await fetch(
          `/api/announcement/announcements/client/${user.address}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const announcements = await resFreelancerAnnouncements.json();

        setAnnouncements(announcements);
      } catch (err) {
        console.error("Errore fetch announcements:", err);
      } finally {
      }
    };

    fetchAnnouncements();
  }, []);

  // Calcolo statistiche basato sui dati mockati (simula il calcolo post-fetch)
  useEffect(() => {
    const newStats = {
      total: announcements.length,
      active: 0,
      presentation: 0,
      completed: 0,
    };

    announcements.forEach((a) => {
      const statusLower = String(a.status || "").toLowerCase();
      if (statusLower === "inprogress") newStats.active += 1;
      else if (statusLower === "inprogress_sent") newStats.presentation += 1;
      else if (statusLower === "completed") newStats.completed += 1;
    });

    setStats(newStats);
  }, [announcements]);

  // --- LOGICA PAGINAZIONE ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = announcements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(announcements.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Gestisci i tuoi annunci di lavoro</p>
        </div>
      </header>

      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Totale Annunci</div>
          <div className={"stat-value"}>{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Attivi</div>
          <div className={"stat-value"}>{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In attesa di presentazione</div>
          <div className={"stat-value"}>{stats.presentation}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completati</div>
          <div className={"stat-value"}>{stats.completed}</div>
        </div>
      </section>

      <section className="cta-row">
        <div className="cta-box">
          <div>
            <h3>Crea un nuovo annuncio</h3>
            <p className="muted">
              Pubblica un nuovo progetto e trova i migliori professionisti
            </p>
          </div>
          <div>
            <button
              onClick={() => navigate("/dashboard/announcement-creation")}
              className="btn primary"
            >
              <span className="plus">+</span> Nuovo Annuncio
            </button>
          </div>
        </div>
      </section>

      <section className="announcements-card">
        <div className="card-header">
          <div>
            <h3>I Tuoi Annunci</h3>
            <p className="muted small">
              Visualizza e gestisci tutti i tuoi annunci pubblicati
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="announcements-table">
            <thead>
              <tr>
                <th>Titolo</th>
                <th>Budget (ETH)</th>
                <th>Stato</th>
                <th>Deadline</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((a) => (
                <tr key={a.id}>
                  <td data-label="Titolo" className="title-cell">
                    {a.title}
                  </td>
                  <td data-label="Budget">{a.budget}</td>
                  <td data-label="Stato">
                    <span
                      className={`status-badge ${
                        a.status === "InProgress" ||
                        a.status === "InProgress_Sent"
                          ? "active"
                          : a.status === "Completed"
                          ? "done"
                          : a.status === "Cancelled"
                          ? "cancelled" // Assumi di avere uno stile per cancelled
                          : "pending"
                      }`}
                    >
                      {a.status === "Open"
                        ? "Aperto"
                        : a.status === "InProgress"
                        ? "In lavorazione"
                        : a.status === "InProgress_Sent"
                        ? "In attesa di presentazione"
                        : a.status === "Completed"
                        ? "Completato"
                        : a.status === "Cancelled"
                        ? "Annullato"
                        : a.status}
                    </span>
                  </td>
                  <td data-label="Deadline">{formatDate(a.deadline)}</td>
                  <td data-label="Azioni" className="actions-cell">
                    <button
                      className="action-btn"
                      title="Visualizza"
                      onClick={() =>
                        navigate(`/client-dashboard/announcement/${a.id}`, {
                          state: { announcement: a },
                        })
                      }
                    >
                      Visualizza
                    </button>
                    <button className="action-btn" title="Modifica">
                      Modifica
                    </button>
                    {a.status === "Open" && (
                      <button className="action-btn danger" title="Elimina">
                        Elimina
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Nessun annuncio trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- CONTROLLI DI PAGINAZIONE --- */}
        {announcements.length > 0 && (
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <div style={{ transform: "rotate(180deg)", display: "flex" }}>
                <ChevronRightIcon width={20} height={20} />
              </div>
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pagination-number ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </div>

            <button
              className="pagination-btn"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon width={20} height={20} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
