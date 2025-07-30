import React from "react";

export type TokenData = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
  patient?: string;
  encounter?: string;
  need_patient_banner?: boolean;
  smart_style_url?: string;
  token_expiry?: number;
} | null;

export type TokenContextType = {
  token: TokenData;
  setToken: (token: TokenData) => void;
  updateToken: (updates: Partial<NonNullable<TokenData>>) => void;
} | null;

export const TokenContext = React.createContext<TokenContextType>(null);
