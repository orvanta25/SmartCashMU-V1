import { useEffect, useRef, useState } from "react";
import Quagga from "@ericblade/quagga2";

interface CameraRearWithQuaggaProps {
  onDetected?: (code: string) => void;
}

function CameraRearWithQuagga({ onDetected = () => {} }: CameraRearWithQuaggaProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);

  const [rearCameraId, setRearCameraId] = useState<string | null>(null);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    beepAudioRef.current = new Audio("/sounds/store-scanner-beep.mp3");
  }, []);

  useEffect(() => {
    async function findRearCamera() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === "videoinput");
        const rear = videoDevices.find(device =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear") ||
          device.label.toLowerCase().includes("environment")
        );
        setRearCameraId(rear ? rear.deviceId : videoDevices[0]?.deviceId || null);
      } catch (e) {
        console.error("Erreur en listant les caméras", e);
      }
    }
    findRearCamera();
  }, []);

  useEffect(() => {
    if (!rearCameraId || !isScanning || !videoRef.current) return;

    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoRef.current,
        constraints: {
          deviceId: { exact: rearCameraId },
          facingMode: "environment",
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 }
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true,
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader",
          "2of5_reader",
          "code_93_reader"
        ]
      },
      locate: true
    }, (err) => {
      if (err) {
        console.error("Erreur lors de l'initialisation de Quagga:", err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected(result => {
      if (result?.codeResult?.code) {
        const code = result.codeResult.code;
        setDetectedCode(code);
        onDetected(code);

        if (beepAudioRef.current) {
          beepAudioRef.current.currentTime = 0;
          beepAudioRef.current.play().catch(() => {});
        }
      }
    });

    return () => {
      Quagga.stop();
      Quagga.offDetected();
    };
  }, [rearCameraId, isScanning, onDetected]);

  const toggleScanning = () => {
    if (isScanning) {
      setDetectedCode(null);
      setIsScanning(false);
    } else {
      setIsScanning(true);
    }
  };

  return (
    <div>
      <button
        onClick={toggleScanning}
        style={{
          marginBottom: 10,
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
          borderRadius: 5,
          border: "2px solid #007bff",
          backgroundColor: isScanning ? "#dc3545" : "#007bff",
          color: "#fff",
          userSelect: "none",
        }}
      >
        {isScanning ? "Fermer le scan" : "Scanner un code-barres"}
      </button>

      {isScanning && (
        <div
          ref={videoRef}
          style={{
            width: "100%",
            maxWidth: 400,
            height: 450,
            border: "1px solid #ddd",
            borderRadius: 8,
            margin: "0 auto",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        />
      )}

      {isScanning && detectedCode && (
        <div style={{ marginTop: 10, fontSize: 18, fontWeight: "bold" }}>
          Code détecté : {detectedCode}
        </div>
      )}
    </div>
  );
}

export default CameraRearWithQuagga;


