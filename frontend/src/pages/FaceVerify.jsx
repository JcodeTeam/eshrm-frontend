import { useState, useRef } from "react";
import Webcam from "react-webcam";
import API from "../api";
import LogoutButton from "../components/LogoutButton";

export default function FaceVerify() {
    const webcamRef = useRef(null);
    const [message, setMessage] = useState("");
    const [confidence, setConfidence] = useState(null);
    const [loading, setLoading] = useState(false);

    const captureAndVerify = async () => {
        setLoading(true);
        setMessage("");
        setConfidence(null);

        try {
            const imageSrc = webcamRef.current.getScreenshot();

            if (!imageSrc) {
                setMessage("Gagal mengambil foto.");
                setLoading(false);
                return;
            }

            const res = await API.post(
                "/verify",
                { image: imageSrc },
                { headers: { "Content-Type": "application/json" } }
            );

            if (res.data.success) {
                setMessage(res.data.message);
                setConfidence(res.data.confidence);
            } else {
                setMessage(res.data.message || "Verifikasi gagal.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Terjadi kesalahan saat verifikasi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 transition-colors duration-300">
            <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 flex flex-col items-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 dark:text-white mb-6">
                    Absensi Wajah
                </h1>

                {/* Webcam */}
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        screenshotQuality={1}
                        videoConstraints={{
                            width: 640,
                            height: 480,
                            facingMode: "user",
                        }}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Button */}
                <div className="mt-6 w-full">
                    <button
                        onClick={captureAndVerify}
                        disabled={loading}
                        className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline-offset-2 transition"
                    >
                        {loading ? "Memproses..." : "Ambil Foto & Verifikasi"}
                    </button>
                </div>

                {/* Hasil */}
                {message && (
                    <div className="mt-6 w-full text-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {message}
                        </h3>
                        {confidence && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Tingkat keyakinan:{" "}
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                    {confidence}%
                                </span>
                            </p>
                        )}
                    </div>
                )}

                {/* Logout */}
                <div className="mt-8">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
