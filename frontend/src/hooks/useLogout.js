import { useAuthContext } from './useAuthContext';

export const useLogout = () => {
    const { dispatch } = useAuthContext();

    const logout = async () => {
        try {
            // Chiama l'endpoint di logout (opzionale, per pulire il cookie)
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // Invia i cookie
            });
        } catch (err) {
            console.error('Errore logout:', err);
            // Continua comunque con il logout locale
        }

        // Rimuovi dal localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');

        // Aggiorna il context
        dispatch({ type: 'LOGOUT' });
    };

    return { logout };
};