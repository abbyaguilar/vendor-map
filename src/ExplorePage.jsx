import Map from "./Map";
import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import HeartButton from "./HeartButton";

export default function ExplorePage({ user }) {
    const [selectedCat, setSelectedCat] = useState("All");
    const [businesses, setBusinesses] = useState([]);
    const [search, setSearch] = useState("");

    /* ================= LOAD BUSINESSES ================= */
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "businesses"), (snap) => {
            const data = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));

            setBusinesses(data);
        });

        return () => unsub();
    }, []);

    /* ================= CATEGORIES ================= */
    const categories = [
        { label: "All", icon: "✨" },
        { label: "Vintage", icon: "🛍️" },
        { label: "Food", icon: "🌮" },
        { label: "Services", icon: "💎" },
        { label: "Art", icon: "🎨" },
        { label: "Bakery", icon: "🧁" },
        { label: "Entertainment", icon: "🎭" },
    ];

    /* ================= FILTER ================= */
    const filtered = businesses.filter((b) => {
        const matchesCategory =
            selectedCat === "All" || b.category === selectedCat;

        const matchesSearch =
            (b.name || "").toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    return (
        <div style={wrap}>
            <div style={container}>

                {/* ================= HEADER ================= */}
                <div style={header}>
                    <h1 style={title}>Discover</h1>

                    <div style={subtitle}>
                        Find local vendors near you
                    </div>

                    <input
                        style={searchInput}
                        placeholder="Search vendors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* ================= MAP ================= */}
                <div style={mapCard}>
                    <Map user={user} />
                </div>

                {/* ================= CATEGORIES ================= */}
                <div style={cats}>
                    {categories.map((cat) => (
                        <button
                            key={cat.label}
                            style={chip(selectedCat === cat.label)}
                            onClick={() => setSelectedCat(cat.label)}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* ================= LIST ================= */}
                <div style={list}>
                    {filtered.map((b) => (
                        <div key={b.id} style={card}>

                            <div style={topRow}>
                                <div>
                                    <div style={name}>
                                        {b.name || "Unnamed Business"}
                                    </div>

                                    <div style={category}>
                                        {b.category || "Uncategorized"}
                                    </div>
                                </div>

                                <HeartButton
                                    user={user}
                                    businessId={b.id}
                                />
                            </div>

                            <div style={description}>
                                {b.description || "No description yet"}
                            </div>

                            <div style={liveBadge(b.isLive)}>
                                {b.isLive ? "🔴 LIVE" : "⚪ OFFLINE"}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

/* ================= FIXED SCROLL LAYOUT ================= */

const wrap = {
    width: "100%",
    display: "flex",
    justifyContent: "center",

    /* IMPORTANT: no overflow here */
    paddingBottom: 120,
};

const container = {
    width: "100%",
    maxWidth: 650,

    padding: 20,

    /* IMPORTANT FIX:
       allows web scroll to behave naturally */
    minHeight: "100vh",
    boxSizing: "border-box",
};

/* ================= UI ================= */

const header = {
    textAlign: "center",
    marginBottom: 24,
};

const title = {
    fontSize: 36,
    fontWeight: 800,
};

const subtitle = {
    color: "#64748b",
    marginBottom: 20,
};

const searchInput = {
    width: "100%",
    padding: 16,
    borderRadius: 18,
    border: "none",
    outline: "none",
    background: "#fff",
    boxShadow: "0 4px 18px rgba(0,0,0,.06)",
};

const mapCard = {
    height: 220,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 28,
};

const cats = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 20,
};

const chip = (active) => ({
    border: "none",
    borderRadius: 999,
    padding: "10px 14px",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    fontWeight: 600,
});

const list = {
    display: "flex",
    flexDirection: "column",
    gap: 14,
};

const card = {
    background: "#fff",
    borderRadius: 26,
    padding: 20,
    boxShadow: "0 6px 20px rgba(0,0,0,.06)",
};

const topRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const name = {
    fontSize: 18,
    fontWeight: 700,
};

const category = {
    fontSize: 13,
    color: "#64748b",
};

const description = {
    marginTop: 12,
    color: "#64748b",
};

const liveBadge = (live) => ({
    marginTop: 12,
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: live ? "#fee2e2" : "#f1f5f9",
    color: live ? "#dc2626" : "#64748b",
});