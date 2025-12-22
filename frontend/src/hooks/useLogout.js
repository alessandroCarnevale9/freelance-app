import { useAuthContext } from "./useAuthContext";

export const useLogout = () => {
    const { dispatch } = useAuthContext();

    const logout = async () => {
        try {
            // Chiamata al backend per invalidare il refresh token
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include", // Importante per inviare i cookie
            });
        } catch (error) {
            console.error("Errore durante il logout:", error);
        } finally {
            // Rimuovi i dati dal localStorage
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");

            // Aggiorna il context
            dispatch({ type: "LOGOUT" });
        }
    };

    return { logout };
};