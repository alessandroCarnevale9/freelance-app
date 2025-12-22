import './FreelancerDashboard.css';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

import {
    SearchIcon,
    EditIcon
} from "@icons";


const FreelancerDashboard = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    return (
        <div className="freelancer-dashboard">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1>Dashboard Freelancer</h1>
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
                        <h2>Benvenuto, {user?.nickname || 'Freelancer'}!</h2>
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
                            onClick={() => navigate('/jobs')}
                        >
                            <div className="action-icon">
                                <SearchIcon />
                            </div>
                            <h3>Cerca Lavori</h3>
                            <p>Esplora nuovi annunci disponibili</p>
                        </button>

                        <button
                            className="action-card"
                            onClick={() => navigate(`/profile/edit`)}
                        >
                            <div className="action-icon">
                                <EditIcon />
                            </div>
                            <h3>Aggiorna Profilo</h3>
                            <p>Migliora il tuo profilo professionale</p>
                        </button>
                    </div>
                </div>

                {/* Sezioni Dashboard */}
                <div className="dashboard-sections">
                    <div className="dashboard-row">
                        <div
                            className="dashboard-card clickable"
                            onClick={() => navigate('/freelancer/active-jobs')}
                        >
                            <div className="card-header">
                                <h3>Lavori in Corso</h3>
                                <span className="badge">0</span>
                            </div>
                            <p>Progetti su cui stai lavorando</p>
                            <div className="card-footer">
                                <span className="link-text">Visualizza tutti →</span>
                            </div>
                        </div>

                        <div
                            className="dashboard-card clickable"
                            onClick={() => navigate('/freelancer/applications')}
                        >
                            <div className="card-header">
                                <h3>Candidature Inviate</h3>
                                <span className="badge warning">0</span>
                            </div>
                            <p>Candidature in attesa di risposta</p>
                            <div className="card-footer">
                                <span className="link-text">Visualizza tutte →</span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-row">
                        <div
                            className="dashboard-card clickable"
                            onClick={() => navigate('/jobs')}
                        >
                            <div className="card-header">
                                <h3>Nuovi Annunci</h3>
                                <span className="badge info">0</span>
                            </div>
                            <p>Annunci pubblicati di recente</p>
                            <div className="card-footer">
                                <span className="link-text">Esplora →</span>
                            </div>
                        </div>

                        <div
                            className="dashboard-card clickable"
                            onClick={() => navigate('/freelancer/completed')}
                        >
                            <div className="card-header">
                                <h3>Lavori Completati</h3>
                                <span className="badge success">0</span>
                            </div>
                            <p>Progetti terminati con successo</p>
                            <div className="card-footer">
                                <span className="link-text">Visualizza tutti →</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiche rapide */}
                <div className="stats-section">
                    <h2>Le Tue Statistiche</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Candidature Inviate</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Lavori Attivi</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Progetti Completati</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0 ETH</span>
                            <span className="stat-label">Guadagni Totali</span>
                        </div>
                    </div>
                </div>

                {/* Suggerimento completamento profilo */}
                <div className="profile-completeness">
                    <h3>Completa il tuo profilo</h3>
                    <p>Un profilo completo aumenta le tue possibilità di essere scelto</p>
                    <div className="completeness-bar">
                        <div className="completeness-fill" style={{ width: '60%' }}></div>
                    </div>
                    <button
                        className="complete-profile-btn"
                        onClick={() => navigate(`/profile/edit`)}
                    >
                        Completa Profilo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FreelancerDashboard;