import './ClientDashboard.css';
import { useAuthContext } from '../../hooks/useAuthContext';

const ClientDashboard = () => {
    const { user } = useAuthContext();

    return (
        <div className="client-dashboard">
            <div className="dashboard-container">
                <h1>Dashboard Cliente</h1>

                <div className="welcome-message">
                    <h2>Benvenuto, {user?.nickname || 'Cliente'}!</h2>
                    <p>Questa è la tua dashboard da cliente.</p>
                    {user?.address && (
                        <p className="wallet-address">
                            Wallet: {user.address.slice(0, 6)}...{user.address.slice(-4)}
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