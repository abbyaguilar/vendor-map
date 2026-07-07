import { useState, useEffect } from "react";
import { auth } from "./firebase";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";

export default function PhoneLogin({ onLogin }) {
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [confirm, setConfirm] = useState(null);
    const [step, setStep] = useState("phone"); // phone | code
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                "recaptcha",
                { size: "invisible" }
            );
        }
    }, []);

    // 🔥 SEND CODE (AUTO +1)
    const sendCode = async () => {
        try {
            setLoading(true);

            let formatted = phone.trim();

            if (!formatted.startsWith("+")) {
                formatted = "+1" + formatted;
            }

            const res = await signInWithPhoneNumber(
                auth,
                formatted,
                window.recaptchaVerifier
            );

            setConfirm(res);
            setStep("code");

        } catch (err) {
            console.log(err);
            alert("Could not send code. Check number.");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 VERIFY CODE
    const verify = async () => {
        try {
            setLoading(true);

            if (!confirm) {
                alert("Please request code first");
                return;
            }

            const userCred = await confirm.confirm(code);

            onLogin(userCred.user);

        } catch (err) {
            console.log(err);
            alert("Wrong or expired code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlay}>
            <div style={sheet}>

                <h2 style={{ margin: 0 }}>Welcome</h2>
                <p style={sub}>
                    Sign in to save and sell vendors
                </p>

                {/* PHONE STEP */}
                {step === "phone" && (
                    <>
                        <div style={inputWrap}>
                            <span style={prefix}>+1</span>

                            <input
                                style={input}
                                placeholder="Phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <button
                            style={primaryBtn}
                            onClick={sendCode}
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Code"}
                        </button>
                    </>
                )}

                {/* CODE STEP */}
                {step === "code" && (
                    <>
                        <input
                            style={input}
                            placeholder="Enter verification code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />

                        <button
                            style={primaryBtn}
                            onClick={verify}
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Login"}
                        </button>
                    </>
                )}

                <div id="recaptcha"></div>

                <p style={foot}>
                    By continuing, you agree to use this app responsibly
                </p>

            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 99999,
};

const sheet = {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
};

const sub = {
    fontSize: 13,
    opacity: 0.6,
    marginTop: -6,
};

const inputWrap = {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    paddingLeft: 10,
};

const prefix = {
    fontSize: 14,
    opacity: 0.6,
    marginRight: 6,
};

const input = {
    width: "100%",
    padding: 12,
    border: "none",
    outline: "none",
    fontSize: 14,
};

const primaryBtn = {
    padding: 12,
    borderRadius: 999,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
};

const foot = {
    fontSize: 11,
    opacity: 0.4,
    textAlign: "center",
    marginTop: 4,
};