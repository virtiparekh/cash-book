import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
import "./styles/variables.css";
import "./styles/global.css";
import { CashBookProvider } from "./contexts/CashBookContext";

/* 

App
 │
 ▼
CashBookProvider
 │
 ├── Dashboard
 ├── Members
 ├── Categories
 ├── Transactions
 └── Settings

Now every page can access the selected cash book. 

*/

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <AuthProvider>
      <CashBookProvider>
         <App />
      </CashBookProvider>
    </AuthProvider>
  </StrictMode>
);