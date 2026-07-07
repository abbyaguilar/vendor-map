import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function CreateBusiness({ user, onCreated }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Food");
    const [loading, setLoading] = useState(false);

    const create = async () => {
        if (!name.trim()) return alert("Enter a business name");
        if (!user) return alert("You must be logged in");

        setLoading(true);

        try {
            await addDoc(collection(db, "businesses"), {
                ownerId: user.uid,
                name: name.trim(),
                category,
                description: "",
                isLive: false,
                lat: null,
                lng: null,
                createdAt: Date.now(),
            });

            setName("");
            setCategory("Food");

            onCreated?.();
        } catch (e) {
            console.log(e);
            alert("Error creating business");
        }

        setLoading(false);
    };

    return (
        <div style={wrap}>
            <div style={card}>
                <h2>Create your business</h2>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Business name"
                    style={input}
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={input}
                >
                    <option>Food</option>
                    <option>Vintage</option>
                    <option>Services</option>
                    <option>Art</option>
                    <option>Bakery</option>
                    <option>Entertainment</option>
                </select>

                <button onClick={create} style={btn(loading)}>
                    {loading ? "Creating..." : "Create"}
                </button>
            </div>
        </div>
    );
}

const wrap = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    fontFamily: "system-ui",
};

const card = {
    width: 420,
    background: "#fff",
    padding: 24,
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,.08)",
};

const input = {
    width: "100%",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
};

const btn = (loading) => ({
    width: "100%",
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: loading ? "#999" : "#111",
    color: "white",
});