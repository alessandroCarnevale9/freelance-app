import { createContext, useReducer, useEffect, useState } from "react";

export const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null });
  const [loading, setLoading] = useState(true);

  // Ripristina l'utente dal localStorage al mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("accessToken");

    if (user && token) {
      // Verifica che il token non sia scaduto facendo una richiesta veloce
      // Oppure semplicemente ripristina l'utente
      dispatch({ type: "LOGIN", payload: user });
    }

    setLoading(false); // Fine caricamento
  }, []);

  // Interceptor globale per fetch per gestire redirect su 401
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        if (response.status === 401) {
          localStorage.clear();
          dispatch({ type: "LOGOUT" });
          window.location.replace("/");
        }

        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Log per debug
  useEffect(() => {
    console.log("AuthContext state: ", state);
  }, [state]);

  // Non renderizzare nulla finché non abbiamo controllato il localStorage
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-box">
          <div className="spinner"></div>
          <div className="loading-text">Caricamento</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
