import "./DashboardPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: "Totale Annunci", value: 0 },
    { label: "Attivi", value: 0, color: "green" },
    { label: "In attese di presentazione", value: 0, color: "orange" },
    { label: "Completati", value: 0 },
  ]);
  const [announcements, setAnnouncements] = useState([]);

  const announcement = [
    {
      id: 1,
      title: "Sviluppo App Mobile React Native",
      budget: "€3,000 - €5,000",
      status: "Attivo",
      deadline: "15/01/2024",
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Gestisci i tuoi annunci di lavoro</p>
        </div>
      </header>

      <section className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.color || ""}`}>{s.value}</div>
          </div>
        ))}
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
                <th>Budget</th>
                <th>Stato</th>
                <th>Deadline</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id}>
                  <td data-label="Titolo" className="title-cell">
                    {a.title}
                  </td>
                  <td data-label="Budget">{a.budget}</td>
                  <td data-label="Stato">
                    <span
                      className={`status-badge ${
                        a.status === "Attivo"
                          ? "active"
                          : a.status === "Completato"
                          ? "done"
                          : "pending"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td data-label="Deadline">{a.date}</td>
                  <td data-label="Azioni" className="actions-cell">
                    <button className="action-btn" title="Visualizza">
                      Visualizza
                    </button>
                    <button className="action-btn" title="Modifica">
                      Modifica
                    </button>
                    <button className="action-btn danger" title="Elimina">
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
