import { Routes, Route } from "react-router-dom";
import { AppRoutes } from "./core";
import { Home } from "./features/home";
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
        <Route path={AppRoutes.CernerLogin} element={<SmartInitialLogin />} />
        <Route
          path={AppRoutes.CernerCallback}
          element={<SmartAuthCallback />}
        />
      </Routes>
    </TokenProvider>
  );
}

export default App;
