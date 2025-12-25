import './ClientDashboard.css';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { AddToQueueIcon, SearchIcon } from "@icons";

const ClientDashboard = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    return (
        <div className="client-dashboard">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1>Dashboard Cliente</h1>
                        <button
                            className="profile-btn"
                            onClick={() => navigate(`/profile/${user?.address}`)}
                        >
                            Visualizza Profilo
                        </button>
                    </div>
                </div>

                <div className="welcome-section">
                    <div className="welcome-card">
                        <h2>Benvenuto, {user?.nickname || 'Cliente'}!</h2>
                        <p className="wallet-info">
                            Wallet: {user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : ''}
                        </p>
                    </div>
                </div>

                {/* Azioni Rapide */}
                <div className="quick-actions">
                    <h2>Azioni Rapide</h2>
                    <div className="actions-grid">
                        <button
                            className="action-card primary"
                            onClick={() => navigate('/dashboard/announcement-creation')}
                        >
                            <div className="action-icon">
                                <AddToQueueIcon width={48} height={48} />
                            </div>
                            <h3>Pubblica Annuncio</h3>
                            <p>Crea un nuovo annuncio di lavoro</p>
                        </button>

                        <button
                            className="action-card"
                            onClick={() => navigate('/freelancers')}
                        >
                            <div className="action-icon">
                                <SearchIcon width={48} height={48} />
                            </div>
                            <h3>Cerca Freelancer</h3>
                            <p>Esplora i profili disponibili</p>
                        </button>
                    </div>
                </div>

                {/* Sezioni Dashboard */}
                <div className="dashboard-sections">
                    <div className="dashboard-row">
                        <div
                            className="dashboard-card clickable"
                            onClick={() => navigate('/client/jobs')}
                        >
                            <div className="card-header">
                                <h3>I Miei Annunci</h3>
                                <span className="badge">0</span>
                            </div>
                            <p>Gestisci gli annunci che hai pubblicato</p>
                            <div className="card-footer">
                                <span className="link-text">Visualizza tutti →</span>
                            </div>
                        </div>

                        <div
                            className="dashboard-card clickable"
                            onClick={() => navigate('/client/active-jobs')}
                        >
                            <div className="card-header">
                                <h3>Lavori in Corso</h3>
                                <span className="badge">0</span>
                            </div>
                            <p>Progetti con freelancer assegnati</p>
                            <div className="card-footer">
                                <span className="link-text">Visualizza tutti →</span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-row">
                        <div
                            className="dashboard-card clickable"
                            onClick={() => navigate('/client/applications')}
                        >
                            <div className="card-header">
                                <h3>Candidature Ricevute</h3>
                                <span className="badge warning">0</span>
                            </div>
                            <p>Nuove candidature ai tuoi annunci</p>
                            <div className="card-footer">
                                <span className="link-text">Visualizza tutte →</span>
                            </div>
                        </div>

                        <div
                            className="dashboard-card clickable"
                            onClick={() => navigate('/client/completed')}
                        >
                            <div className="card-header">
                                <h3>Progetti Completati</h3>
                                <span className="badge success">0</span>
                            </div>
                            <p>Lavori terminati con successo</p>
                            <div className="card-footer">
                                <span className="link-text">Visualizza tutti →</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiche rapide */}
                <div className="stats-section">
                    <h2>Statistiche</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Annunci Pubblicati</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Freelancer Assunti</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Progetti Completati</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0 ETH</span>
                            <span className="stat-label">Budget Totale Speso</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;