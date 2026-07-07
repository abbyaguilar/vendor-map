import { db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function SetLocation({ user }) {
    const setLocation = () => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            await updateDoc(doc(db, "businesses", user.uid), {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            });
        });
    };

    return <button onClick={setLocation}>📍 Set Location</button>;
}