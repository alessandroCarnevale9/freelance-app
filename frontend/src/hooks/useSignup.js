import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useSignup = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();

    const signup = async (signupData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/metamask-signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(signupData),
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || "Errore durante la registrazione");
            }

            // La risposta ora è: { user: {...}, accessToken: "..." }
            // Non più: { returnUser: { user: {...} }, accessToken: "..." }

            // Salva l'utente in localStorage
            localStorage.setItem("user", JSON.stringify(json.user));

            // Salva l'accessToken (opzionale, dipende dalla tua gestione)
            localStorage.setItem("accessToken", json.accessToken);

            // Aggiorna il context
            dispatch({ type: "LOGIN", payload: json.user });

            setIsLoading(false);
            return json;
        } catch (err) {
            setIsLoading(false);
            setError(err.message);
            throw err;
        }
    };

    return { signup, isLoading, error };
};