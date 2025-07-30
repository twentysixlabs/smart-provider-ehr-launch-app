import React from "react";
import { TokenContext } from "../contexts/TokenContext";

export function useToken() {
  const context = React.useContext(TokenContext);
  if (!context) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
}
