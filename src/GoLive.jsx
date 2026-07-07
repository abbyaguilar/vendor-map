import { db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function GoLive({ user }) {
    const goLive = () => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            await updateDoc(doc(db, "businesses", user.uid), {
                isLive: true,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            });

            alert("You are LIVE");
        });
    };

    const goOffline = async () => {
        await updateDoc(doc(db, "businesses", user.uid), {
            isLive: false,
        });

        alert("Offline");
    };

    return (
        <div>
            <button onClick={goLive}>🟢 Go Live</button>
            <button onClick={goOffline}>🔴 End</button>
        </div>
    );
}