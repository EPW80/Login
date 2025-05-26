import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <LoginPage />
      </div>
    </AuthProvider>
  );
}

export default App;
