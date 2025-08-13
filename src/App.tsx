import { Routes, Route } from "react-router-dom";
import { AppRoutes } from "./core";
import { Home } from "./features/home";
import { PatientDataPage } from "./features/patient";
import {
  SmartInitialLogin,
  SmartAuthCallback,
  TokenProvider,
} from "./features/auth";

function App() {
  return (
    <TokenProvider>
      <Routes>
        <Route path={AppRoutes.Home} element={<Home />} />
        <Route path={AppRoutes.PatientData} element={<PatientDataPage />} />
        <Route path={AppRoutes.SmartLogin} element={<SmartInitialLogin />} />
        <Route path={AppRoutes.SmartCallback} element={<SmartAuthCallback />} />
      </Routes>
    </TokenProvider>
  );
}

export default App;
