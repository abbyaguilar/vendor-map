import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

export default function Saved({ user }) {
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        setLoading(true);

        const ref = collection(db, "users", user.uid, "hearts");

        const unsub = onSnapshot(ref, async (snap) => {
            try {
                const ids = snap.docs.map((d) => d.id);

                if (ids.length === 0) {
                    setSaved([]);
                    setLoading(false);
                    return;
                }

                const results = await Promise.all(
                    ids.map(async (id) => {
                        const bizRef = doc(db, "businesses", id);
                        const bizSnap = await getDoc(bizRef);

                        if (!bizSnap.exists()) return null;

                        return {
                            id: bizSnap.id,
                            ...bizSnap.data(),
                        };
                    })
                );

                setSaved(results.filter(Boolean));
            } catch (err) {
                console.log("Saved page error:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsub();
    }, [user]);

    /* ================= UI STATES ================= */

    if (!user) {
        return (
            <div style={empty}>
                <h2 style={title}>Login required</h2>
                <p style={sub}>You need to log in to view saved businesses</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={empty}>
                <h2 style={title}>Loading saved...</h2>
            </div>
        );
    }

    if (saved.length === 0) {
        return (
            <div style={empty}>
                <h2 style={title}>No saved businesses yet</h2>
                <p style={sub}>
                    Tap ❤️ on any vendor to save it here
                </p>
            </div>
        );
    }

    /* ================= MAIN UI ================= */

    return (
        <div style={wrap}>
            <div style={container}>
                <h2 style={header}>Saved</h2>

                {saved.map((b) => (
                    <div key={b.id} style={card}>
                        <div style={topRow}>
                            <h3 style={name}>{b.name}</h3>

                            <span style={badge}>
                                {b.category}
                            </span>
                        </div>

                        <p style={desc}>
                            {b.description || "No description"}
                        </p>

                        <div style={status(b.isLive)}>
                            {b.isLive ? "🔴 LIVE" : "⚪ OFFLINE"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const wrap = {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    fontFamily: "system-ui",
};

const container = {
    width: "100%",
    maxWidth: 520,
};

const header = {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 16,
    color: "#111827",
};

const card = {
    background: "white",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,.06)",
};

const topRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const name = {
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
};

const badge = {
    background: "#111827",
    color: "white",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
};

const desc = {
    marginTop: 10,
    fontSize: 14,
    color: "#64748b",
};

const status = (live) => ({
    marginTop: 10,
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: live ? "#fee2e2" : "#f1f5f9",
    color: live ? "#dc2626" : "#64748b",
});

const empty = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "system-ui",
    color: "#64748b",
    textAlign: "center",
    padding: 20,
};

const title = {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
};

const sub = {
    marginTop: 8,
    fontSize: 14,
};