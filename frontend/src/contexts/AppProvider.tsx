import { useReducer } from "react";
import appReducer from "./appReducer";
import { ReactNode } from "react";
import initialState from "./initialState";
import AppContext from "./AppContext";
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
export default AppProvider;