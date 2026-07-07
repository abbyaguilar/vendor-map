import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

export default function VendorDashboard({ user }) {
    const [businesses, setBusinesses] = useState([]);
    const [selectedBiz, setSelectedBiz] = useState(null);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");

    /* ================= LOAD BUSINESSES ================= */
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "businesses"),
            where("ownerId", "==", user.uid)
        );

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));

            setBusinesses(list);

            if (list.length > 0) {
                const stillExists =
                    selectedBiz &&
                    list.find((b) => b.id === selectedBiz.id);

                if (!stillExists) {
                    selectBusiness(list[0]);
                }
            } else {
                setSelectedBiz(null);
            }
        });

        return () => unsub();
    }, [user]);

    /* ================= SELECT BUSINESS ================= */
    const selectBusiness = (biz) => {
        setSelectedBiz(biz);
        setName(biz.name || "");
        setCategory(biz.category || "");
        setDescription(biz.description || "");
    };

    /* ================= SAVE ================= */
    const save = async () => {
        if (!selectedBiz) return;

        await updateDoc(doc(db, "businesses", selectedBiz.id), {
            name,
            category,
            description,
        });

        alert("Saved!");
    };

    /* ================= TOGGLE LIVE ================= */
    const toggleLive = () => {
        if (!selectedBiz) return;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const newState = !selectedBiz.isLive;

                const update = {
                    isLive: newState,
                };

                if (newState) {
                    update.lat = pos.coords.latitude;
                    update.lng = pos.coords.longitude;
                }

                await updateDoc(
                    doc(db, "businesses", selectedBiz.id),
                    update
                );

                setSelectedBiz((prev) => ({
                    ...prev,
                    ...update,
                }));
            },
            (err) => {
                alert("Location permission denied.");
                console.log(err);
            }
        );
    };

    /* ================= DELETE ================= */
    const remove = async () => {
        if (!selectedBiz) return;

        await deleteDoc(doc(db, "businesses", selectedBiz.id));

        setSelectedBiz(null);
        setName("");
        setCategory("");
        setDescription("");
    };

    /* ================= SLUG (ONLY ONE SOURCE OF TRUTH) ================= */
    const getSlug = (biz) => {
        if (!biz) return null;

        // ALWAYS prefer stored slug
        if (biz.slug) return biz.slug;

        // fallback ONLY if missing (prevents crash)
        return biz.name
            ?.toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    };

    /* ================= COPY LINK (FIXED + RELIABLE) ================= */
    const copyLink = async (biz) => {
        if (!biz) {
            alert("No business selected");
            return;
        }

        const slug = getSlug(biz);
        const url = `${window.location.origin}/business/${biz.ownerId}/${biz.id}`;

        try {
            await navigator.clipboard.writeText(url);
            alert("Copied link:\n" + url);
        } catch (err) {
            console.log(err);

            // fallback
            const textArea = document.createElement("textarea");
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);

            alert("Copied link:\n" + url);
        }
    };

    /* ================= UI ================= */
    if (!user) return <p>Please log in</p>;

    if (businesses.length === 0) {
        return (
            <div style={empty}>
                <h2>No business yet</h2>
                <p>Create one in Sell tab</p>
            </div>
        );
    }

    return (
        <div style={wrap}>

            {/* LEFT LIST */}
            <div style={sidebar}>
                <h3 style={{ marginBottom: 10 }}>My Businesses</h3>

                {businesses.map((b) => (
                    <div
                        key={b.id}
                        onClick={() => selectBusiness(b)}
                        style={{
                            ...bizItem,
                            background:
                                selectedBiz?.id === b.id
                                    ? "#111827"
                                    : "#fff",
                            color:
                                selectedBiz?.id === b.id
                                    ? "#fff"
                                    : "#111827",
                        }}
                    >
                        {b.name}
                    </div>
                ))}
            </div>

            {/* RIGHT PANEL */}
            <div style={panel}>
                <h3>Dashboard</h3>

                <input
                    placeholder="Business name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={input}
                />

                <input
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={input}
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={textarea}
                />

                <button onClick={save} style={btn}>
                    Save
                </button>

                <button onClick={toggleLive} style={liveBtn}>
                    {selectedBiz?.isLive
                        ? "🔴 Go Offline"
                        : "🟢 Go Live"}
                </button>

                {/* SHARE */}
                <button
                    onClick={() => copyLink(selectedBiz)}
                    style={{
                        background: "#3b82f6",
                        color: "white",
                        padding: 12,
                        borderRadius: 10,
                        border: "none",
                    }}
                >
                    🔗 Copy Share Link
                </button>

                <button onClick={remove} style={deleteBtn}>
                    Delete
                </button>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const wrap = {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "system-ui",
};

const sidebar = {
    width: 220,
    padding: 16,
    borderRight: "1px solid #eee",
};

const bizItem = {
    padding: 10,
    marginBottom: 8,
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid #eee",
};

const panel = {
    flex: 1,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
};

const input = {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
};

const textarea = {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    minHeight: 100,
};

const btn = {
    background: "#111827",
    color: "white",
    padding: 12,
    borderRadius: 10,
    border: "none",
};

const liveBtn = {
    background: "#22c55e",
    color: "white",
    padding: 12,
    borderRadius: 10,
    border: "none",
};

const deleteBtn = {
    background: "#ef4444",
    color: "white",
    padding: 12,
    borderRadius: 10,
    border: "none",
};

const empty = {
    padding: 40,
    textAlign: "center",
};