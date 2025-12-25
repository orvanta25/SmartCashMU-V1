// src/hooks/useDeviceType.ts

import { useEffect, useState } from "react";

type DeviceType = {
  windowSize: { width: number; height: number };
  isSUNMITablet: boolean;
  isDesktop: boolean;
  isCashRegister: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isSurfaceDuo: boolean;
  isIPadMini: boolean;
  isIPadPro: boolean;
  sunMy: boolean;
};

export function useDeviceType(): DeviceType {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { width, height } = windowSize;
  const aspectRatio = width / height;

  const isSUNMITablet =
    width >= 1260 && width <= 1300 &&
    height >= 780 && height <= 820 &&
    aspectRatio > 1.5;

  const isSurfaceDuo =
    width >= 540 && width <= 800 &&
    height >= 650 && height <= 800 &&
    aspectRatio >= 1.0 && aspectRatio <= 1.6;

  const isMobile = width < 540;
  const isTablet = !isSurfaceDuo && width >= 540 && width < 1024;
  const isDesktop = width >= 1366 && !isSUNMITablet;
  const isCashRegister = !isDesktop && (width >= 768 || isSUNMITablet);

  const isIPadMini = width >= 768 && width <= 820 && height >= 1000 && height <= 1180;
  const isIPadPro = width >= 1024 && width <= 1366 && height >= 1366 && height <= 1400;
  const sunMy = width >= 375 && width <= 430 && height >= 780 && height <= 900;

  return {
    windowSize,
    isSUNMITablet,
    isDesktop,
    isCashRegister,
    isTablet,
    isMobile,
    isSurfaceDuo,
    isIPadMini,
    isIPadPro,
    sunMy,
  };
}
