import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import PhoneLogin from "./PhoneLogin";
import ExplorePage from "./ExplorePage";
import CreateBusiness from "./CreateBusiness";
import VendorDashboard from "./VendorDashboard";
import MyBusinesses from "./MyBusinesses";
import BusinessPage from "./BusinessPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("explore");
  const [hasBusiness, setHasBusiness] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // ================= ROUTE DETECTION =================
  const path = window.location.pathname;
  const isBusinessPage = path.startsWith("/business/");

  // /business/:ownerId/:id
  const parts = path.split("/").filter(Boolean);
  const ownerId = parts[1];
  const businessId = parts[2];

  /* ================= CHECK BUSINESS ================= */
  useEffect(() => {
    if (!user) {
      setHasBusiness(false);
      return;
    }

    const q = query(
      collection(db, "businesses"),
      where("ownerId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setHasBusiness(!snap.empty);
    });

    return () => unsub();
  }, [user]);

  /* ================= LOGIN ================= */
  const handleLogin = (u) => {
    setUser(u);

    if (pendingAction === "sell") setPage("create");
    else if (pendingAction === "save") setPage("profile");
    else setPage("explore");

    setPendingAction(null);
  };

  const requireLogin = (action) => setPendingAction(action);

  /* ================= NAV ================= */
  const tabs = [
    { key: "explore", icon: "🗺", label: "Explore" },
    { key: "profile", icon: "❤️", label: "Saved" },
    { key: "create", icon: "➕", label: "Sell" },
    { key: "dashboard", icon: "🏪", label: "Dashboard" },
  ];

  const isActive = (key) => page === key;

  /* ================= 🚨 IMPORTANT ROUTE PRIORITY ================= */
  if (isBusinessPage) {
    return (
      <BusinessPage
        user={user}
        ownerId={ownerId}
        businessId={businessId}
      />
    );
  }

  return (
    <div style={appShell}>

      {/* ================= SCROLL AREA ================= */}
      <div style={scrollArea}>

        {page === "explore" && <ExplorePage user={user} />}

        {page === "create" && (
          <CreateBusiness
            user={user}
            onCreated={() => {
              setHasBusiness(true);
              setPage("dashboard");
            }}
          />
        )}

        {page === "dashboard" && (
          <VendorDashboard user={user} />
        )}

        {page === "profile" && (
          <MyBusinesses user={user} />
        )}

      </div>

      {/* ================= NAV ================= */}
      {user && (
        <div style={nav}>
          {tabs.map((t) => {
            const active = isActive(t.key);
            const disabled = t.key === "dashboard" && !hasBusiness;

            return (
              <button
                key={t.key}
                onClick={() => {
                  if (disabled) return;
                  setPage(t.key);
                }}
                style={{
                  ...tabBtn,
                  opacity: disabled ? 0.4 : 1,
                  color: active ? "#111" : "#999",
                }}
              >
                <div style={icon}>{t.icon}</div>
                <div style={label}>{t.label}</div>
                {active && <div style={dot} />}
              </button>
            );
          })}
        </div>
      )}

      {/* ================= LOGIN ================= */}
      {!user && (
        <div style={overlay}>
          <div style={card}>
            <h2>Welcome</h2>

            <p style={{ fontSize: 13, opacity: 0.6 }}>
              Find and save live vendors near you
            </p>

            <PhoneLogin onLogin={handleLogin} />

            <div style={row}>
              <button style={ghost} onClick={() => requireLogin("save")}>
                ❤️ Save
              </button>

              <button style={primary} onClick={() => requireLogin("sell")}>
                ➕ Sell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const appShell = {
  height: "100dvh",
  display: "flex",
  flexDirection: "column",
  fontFamily: "system-ui",
  background: "#fff",
  overflow: "hidden",
};

const scrollArea = {
  flex: 1,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  paddingBottom: 90,
};

const nav = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: 70,
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(12px)",
  borderTop: "1px solid #eee",
  zIndex: 9999,
};

const tabBtn = {
  flex: 1,
  border: "none",
  background: "transparent",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: 11,
  position: "relative",
};

const icon = { fontSize: 18 };
const label = { fontSize: 10 };

const dot = {
  position: "absolute",
  bottom: 6,
  width: 4,
  height: 4,
  borderRadius: "50%",
  background: "#111",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
};

const card = {
  width: 340,
  background: "#fff",
  padding: 16,
  borderRadius: 16,
};

const row = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const primary = {
  flex: 2,
  padding: 10,
  borderRadius: 999,
  border: "none",
  background: "#111",
  color: "#fff",
};

const ghost = {
  flex: 1,
  padding: 10,
  borderRadius: 999,
  border: "1px solid #ddd",
  background: "#fff",
};