import { db } from "./firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function HeartButton({ user, businessId }) {
    const [hearted, setHearted] = useState(false);

    useEffect(() => {
        if (!user || !businessId) return;

        const load = async () => {
            const ref = doc(db, "users", user.uid, "hearts", businessId);
            const snap = await getDoc(ref);
            setHearted(snap.exists());
        };

        load();
    }, [user, businessId]);

    const toggle = async () => {
        if (!user) return alert("Login first");
        if (!businessId) return console.log("missing businessId ❌");

        const ref = doc(db, "users", user.uid, "hearts", businessId);

        const newState = !hearted;
        setHearted(newState);

        try {
            if (newState) {
                await setDoc(ref, {
                    createdAt: Date.now(),
                });
            } else {
                await deleteDoc(ref);
            }
        } catch (err) {
            console.log(err);
            setHearted(!newState);
        }
    };

    return (
        <button
            onClick={toggle}
            style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "none",
                background: hearted ? "#ff2d55" : "#f1f5f9",
                color: hearted ? "white" : "#111",
                fontWeight: 700,
            }}
        >
            {hearted ? "💖 Saved" : "🤍 Save"}
        </button>
    );
}