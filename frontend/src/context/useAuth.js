import React from "react";
export const AuthCtx = React.createContext(null);
export const useAuth = () => React.useContext(AuthCtx);