import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";

import Chat from "./chat";
import Login from "./Login";

function ChatPage({ onLogout }) {
  const username = localStorage.getItem("username") || "User";

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>AI</div>

          <div>
            <div style={styles.appTitle}>AI SQL Chatbot</div>
            <div style={styles.appSubTitle}>Enterprise Data Assistant</div>
          </div>
        </div>

        <div style={styles.rightSection}>
          <div style={styles.userInfo}>Welcome, {username}</div>

          <button onClick={onLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.chatWrapper}>
        <Chat />
      </div>
    </div>
  );
}

function AppRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("token") !== null
  );

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/chat");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/chat" />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/chat"
        element={
          isLoggedIn ? (
            <ChatPage onLogout={logout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/chat" : "/login"} />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#eef3f9",
    display: "flex",
    flexDirection: "column"
  },

  topBar: {
    height: "72px",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },

  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#1e3c72",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "18px"
  },

  appTitle: {
    fontSize: "20px",
    fontWeight: "bold"
  },

  appSubTitle: {
    fontSize: "12px",
    opacity: 0.85
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },

  userInfo: {
    fontSize: "14px"
  },

  logoutButton: {
    background: "#ffffff",
    color: "#1e3c72",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  chatWrapper: {
    flex: 1,
    overflow: "hidden"
  }
};

export default App;