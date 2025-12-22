import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();

    const login = async ({ address, signedMessage, nonce }) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/metamask-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, signedMessage, nonce }),
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || 'Errore durante il login');
            }

            // Salva nel localStorage
            localStorage.setItem('user', JSON.stringify(json.user));
            localStorage.setItem('accessToken', json.accessToken);

            // Aggiorna il context
            dispatch({ type: 'LOGIN', payload: json.user });

            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            setError(err.message);
            throw err; // Re-throw per permettere la gestione nel componente
        }
    };

    return { login, isLoading, error };
};