import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

// hook necessario ad ottenere l'ogetto user dall'ogetto context
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw Error("useAuthContext must be inside an AuthContextProvider");
  }

  return context;
};
