"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, QrCode } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface QRCodeScannerProps {
  onScan: (value: string) => void;
  className?: string;
}

export default function QRCodeScanner({
  onScan,
  className,
}: QRCodeScannerProps) {
  const scannerRef = useRef<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const startScanner = async () => {
    setError(null);
    setResult(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      const scanner = new Html5Qrcode("qr-reader");

      scannerRef.current = scanner;

      setIsScanning(true);

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          setResult(decodedText);
          setIsScanning(false);

          try {
            await scanner.stop();
          } catch {
            toast.error("internal server error")
          }

          scanner.clear();
          scannerRef.current = null;

          onScan(decodedText);
        },
        () => {
          // Ignore QR detection failures while scanning.
        },
      );
    } catch (err) {
      console.error("QR scanner error:", err);

      setIsScanning(false);

      setError(
        "Unable to access the camera. Please allow camera permission and try again.",
      );
    }
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setIsScanning(false);
      return;
    }

    try {
      await scanner.stop();
      scanner.clear();
    } catch (err) {
      console.error("Failed to stop scanner:", err);
    }

    scannerRef.current = null;
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, []);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/60 shadow-sm",
        className,
      )}
    >
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <QrCode className="size-6" />
        </div>

        <CardTitle className="text-xl">
          Scan Test QR Code
        </CardTitle>

        <CardDescription>
          Scan the QR code displayed by your teacher to open the test.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-5">
        {/* Scanner */}
        <div
          className="
            w-full
            max-w-sm
            overflow-hidden
            rounded-2xl
            border
            bg-muted/30
          "
        >
          <div
            id="qr-reader"
            className="w-full"
          />

          {!isScanning && !result && (
            <div className="flex aspect-square flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Camera className="size-8" />
              </div>

              <div>
                <p className="font-medium">
                  Camera scanner is ready
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Position the QR code inside the camera frame.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Start / Stop */}
        {!isScanning && !result && (
          <Button
            size="lg"
            className="w-full max-w-sm rounded-xl"
            onClick={startScanner}
          >
            <Camera className="mr-2 size-5" />
            Open Camera
          </Button>
        )}

        {isScanning && (
          <Button
            variant="outline"
            size="lg"
            className="w-full max-w-sm rounded-xl"
            onClick={stopScanner}
          >
            Stop Camera
          </Button>
        )}

        {/* Loading */}
        {isScanning && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Scanning for QR code...
          </div>
        )}

        {/* Success */}
        {result && (
          <Alert className="w-full max-w-sm rounded-xl">
            <CheckCircle2 className="size-5 text-primary" />

            <AlertDescription>
              QR code scanned successfully.
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {error && (
          <Alert
            variant="destructive"
            className="w-full max-w-sm rounded-xl"
          >
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
