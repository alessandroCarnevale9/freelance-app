import { createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext();

// prende in input lo stato attuale e un'azione
export const authReducer = (state, action) => {
  // gestiamo le varie azioni, impostando lo stato opportunamente
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload }; // lo stato restituito in questo caso
    case "LOGOUT":
      return { user: null };
    default:
      return state; // restituiamo lo stato così com'è
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  // eseguito una singola volta ad ogni render del componente
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: "LOGIN", payload: user });
      } catch (error) {
        console.error("Errore nel parsing dei dati utente:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  console.log("AuthContext state: ", state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};