import './ClientDashboard.css';
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

const ClientDashboard = () => {
    const { user: authUser } = useAuthContext();
    const userData = getUserData(authUser);

    return (
        <div className="client-dashboard">
            <div className="dashboard-container">
                <h1>Dashboard Cliente</h1>
                <div className="welcome-message">
                    <h2>Benvenuto, {userData?.nickname || 'Cliente'}!</h2>
                    <p>Questa è la tua dashboard da cliente.</p>
                    {userData?.address && (
                        <p className="wallet-address">
                            Wallet: {userData.address.slice(0, 6)}...{userData.address.slice(-4)}
                        </p>
                    )}
                </div>

                {/* Sezioni della dashboard */}
                <div className="dashboard-sections">
                    <div className="dashboard-card">
                        <h3>Cerca Freelancer</h3>
                        <p>Trova il professionista perfetto per il tuo progetto</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>I Miei Progetti</h3>
                        <p>Gestisci i progetti pubblicati</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Freelancer Assunti</h3>
                        <p>Visualizza i freelancer con cui stai lavorando</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Messaggi</h3>
                        <p>Comunicazioni con i freelancer</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;