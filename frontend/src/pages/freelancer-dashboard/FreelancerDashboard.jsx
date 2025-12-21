import './FreelancerDashboard.css';
import { useAuthContext } from '../../hooks/useAuthContext';

// Helper function per ottenere i dati utente dalla struttura nidificata
const getUserData = (authUser) => {
    if (!authUser) return null;

    if (authUser.returnUser?.user) {
        return authUser.returnUser.user;
    }

    if (authUser.user) {
        return authUser.user;
    }

    return authUser;
};

const FreelancerDashboard = () => {
    const { user: authUser } = useAuthContext();
    const userData = getUserData(authUser);

    return (
        <div className="freelancer-dashboard">
            <div className="dashboard-container">
                <h1>Dashboard Freelancer</h1>
                <div className="welcome-message">
                    <h2>Benvenuto, {userData?.nickname || 'Freelancer'}!</h2>
                    <p>Questa è la tua dashboard da freelancer.</p>
                    {userData?.address && (
                        <p className="wallet-address">
                            Wallet: {userData.address.slice(0, 6)}...{userData.address.slice(-4)}
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