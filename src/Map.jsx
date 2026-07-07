import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import {
    collection,
    onSnapshot,
    doc,
    setDoc,
    getDoc,
} from "firebase/firestore";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const DEFAULT_CENTER = {
    lat: 33.6405,
    lng: -117.6022,
};

export default function Map({ user }) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    });

    const mapRef = useRef(null);

    const [vendors, setVendors] = useState([]);
    const [selected, setSelected] = useState(null);
    const [hearts, setHearts] = useState({});

    // 🔥 PERSIST MAP STATE (this is the fix)
    const [mapState, setMapState] = useState(() => {
        const saved = localStorage.getItem("mapState");
        return saved
            ? JSON.parse(saved)
            : {
                center: DEFAULT_CENTER,
                zoom: 15,
            };
    });

    // LOAD BUSINESSES
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "businesses"), (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

            setVendors(data.filter((b) => b.isLive && b.lat && b.lng));
        });

        return () => unsub();
    }, []);

    // LOAD HEARTS
    useEffect(() => {
        if (!user) return;

        const load = async () => {
            const ref = doc(db, "users", user.uid, "hearts", "list");
            const snap = await getDoc(ref);

            if (snap.exists()) setHearts(snap.data());
        };

        load();
    }, [user]);

    // TOGGLE HEART
    const toggleHeart = async (bizId) => {
        if (!user) {
            alert("Please log in to save ❤️");
            return;
        }

        const ref = doc(db, "users", user.uid, "hearts", "list");

        const updated = {
            ...hearts,
            [bizId]: !hearts[bizId],
        };

        setHearts(updated);
        await setDoc(ref, updated);
    };

    if (!isLoaded) return <div>Loading map...</div>;

    return (
        <div style={{ position: "relative", height: "100%" }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapState.center}
                zoom={mapState.zoom}
                options={{
                    gestureHandling: "greedy", // 🔥 fixes 2-finger issue
                    disableDefaultUI: false,
                }}
                onLoad={(map) => {
                    mapRef.current = map;
                }}
                onIdle={() => {
                    if (!mapRef.current) return;

                    const c = mapRef.current.getCenter();

                    const newState = {
                        center: {
                            lat: c.lat(),
                            lng: c.lng(),
                        },
                        zoom: mapRef.current.getZoom(),
                    };

                    setMapState(newState);
                    localStorage.setItem("mapState", JSON.stringify(newState));
                }}
            >
                {vendors.map((v) => (
                    <Marker
                        key={v.id}
                        position={{ lat: v.lat, lng: v.lng }}
                        onClick={() => setSelected(v)}
                    />
                ))}
            </GoogleMap>

            {/* SHEET */}
            {selected && (
                <div style={sheet}>
                    <div style={name}>{selected.name}</div>
                    <div style={category}>{selected.category}</div>

                    <button
                        onClick={() => toggleHeart(selected.id)}
                        style={heartBtn(hearts[selected.id])}
                    >
                        ❤️ {hearts[selected.id] ? "Saved" : "Save"}
                    </button>

                    <button onClick={() => setSelected(null)} style={closeBtn}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

/* styles */
const sheet = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "white",
    padding: 16,
};

const name = { fontSize: 18, fontWeight: 700 };
const category = { fontSize: 13, color: "#666" };

const heartBtn = (saved) => ({
    marginTop: 10,
    padding: 10,
    background: saved ? "#ff2d55" : "#111",
    color: "white",
    border: "none",
    borderRadius: 10,
});

const closeBtn = {
    marginTop: 10,
    padding: 10,
    background: "#eee",
    border: "none",
    borderRadius: 10,
};