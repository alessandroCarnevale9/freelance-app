import './FreelancerDashboard.css';
import { useAuthContext } from '../../hooks/useAuthContext';

const FreelancerDashboard = () => {
    const { user } = useAuthContext();

    return (
        <div className="freelancer-dashboard">
            <div className="dashboard-container">
                <h1>Dashboard Freelancer</h1>

                <div className="welcome-message">
                    <h2>Benvenuto, {user?.nickname || 'Freelancer'}!</h2>
                    <p>Questa è la tua dashboard da freelancer.</p>
                    {user?.address && (
                        <p className="wallet-address">
                            Wallet: {user.address.slice(0, 6)}...{user.address.slice(-4)}
                        </p>
                    )}
                </div>

                {/* Sezioni della dashboard */}
                <div className="dashboard-sections">
                    <div className="dashboard-card">
                        <h3>I Miei Progetti</h3>
                        <p>Visualizza e gestisci i tuoi progetti attivi</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Offerte Ricevute</h3>
                        <p>Controlla le nuove offerte di lavoro</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Profilo</h3>
                        <p>Aggiorna il tuo profilo professionale</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Statistiche</h3>
                        <p>Visualizza le tue performance</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreelancerDashboard;