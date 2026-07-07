import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import HeartButton from "./HeartButton";

export default function BusinessPage({ user, ownerId, businessId }) {
    const [biz, setBiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!businessId) return;

            setLoading(true);

            try {
                const ref = doc(db, "businesses", businessId);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data();

                    if (data.ownerId === ownerId) {
                        setBiz({ id: snap.id, ...data });
                    } else {
                        setBiz(null);
                    }
                } else {
                    setBiz(null);
                }
            } catch (err) {
                console.log(err);
                setBiz(null);
            }

            setLoading(false);
        };

        load();
    }, [ownerId, businessId]);

    if (loading) {
        return <div style={{ padding: 40 }}>Loading business...</div>;
    }

    if (!biz) {
        return <div style={{ padding: 40 }}>Business not found</div>;
    }

    return (
        <div style={wrap}>
            <div style={card}>
                <h1>{biz.name}</h1>
                <p>{biz.description}</p>

                <div>Category: {biz.category}</div>

                <HeartButton user={user} businessId={biz.id} />

                {biz.isLive && biz.lat && biz.lng && (
                    <iframe
                        width="100%"
                        height="250"
                        style={{ borderRadius: 12, marginTop: 20 }}
                        loading="lazy"
                        src={`https://www.google.com/maps?q=${biz.lat},${biz.lng}&z=15&output=embed`}
                    />
                )}

                {!biz.isLive && (
                    <p style={{ color: "gray" }}>🔴 Offline</p>
                )}
            </div>
        </div>
    );
}

const wrap = {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: 20,
    display: "flex",
    justifyContent: "center",
};

const card = {
    width: "100%",
    maxWidth: 500,
    background: "#fff",
    padding: 20,
    borderRadius: 20,
};