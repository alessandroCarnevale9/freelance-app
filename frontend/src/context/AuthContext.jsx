import { createContext, useReducer, useEffect, useState } from 'react';

export const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload };
    case 'LOGOUT':
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
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('accessToken');

    if (user && token) {
      // Verifica che il token non sia scaduto facendo una richiesta veloce
      // Oppure semplicemente ripristina l'utente
      dispatch({ type: 'LOGIN', payload: user });
    }

    setLoading(false); // Fine caricamento
  }, []);

  // Log per debug (opzionale, puoi rimuoverlo)
  useEffect(() => {
    console.log('AuthContext state: ', state);
  }, [state]);

  // Non renderizzare nulla finché non abbiamo controllato il localStorage
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Caricamento...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};