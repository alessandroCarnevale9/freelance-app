import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

// hook necessario ad ottenere l'oggetto user dall'oggetto context
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw Error("useAuthContext must be inside an AuthContextProvider");
  }

  return context;
};