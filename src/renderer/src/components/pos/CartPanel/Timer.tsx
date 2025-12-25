'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  caissierName: string;
}

export default function Timer({ caissierName }: TimerProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formaterDate = (date: Date) => {
    const jour = date.getDate().toString().padStart(2, '0');
    const mois = (date.getMonth() + 1).toString().padStart(2, '0');
    const annee = date.getFullYear();
    return `${jour}/${mois}/${annee}`;
  };

  const formaterHeure = (date: Date) => {
    const heures = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const secondes = date.getSeconds().toString().padStart(2, '0');
    return `${heures}:${minutes}:${secondes}`;
  };

  if (!currentTime) {
    return <div className="w-full h-full bg-transparent" />;
  }

  return (
    <div className="w-full h-full bg-transparent text-orange-500 font-mono px-4 py-2">
      {/* Libellés Caissier */}
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white text-lg">
          Caissier : <span className="font-extrabold text-amber-300">{caissierName || '...'}</span>
        </span>
      </div>

      {/* Date et Heure */}
      <div className="flex justify-between items-center">
        <span className="text-lg text-white/90 font-medium bg-white/5 px-3 py-2 rounded-lg">
          {formaterDate(currentTime)}
        </span>
        <span className="text-2xl font-bold text-amber-400 bg-black/20 px-4 py-2 rounded-xl border border-amber-400/30">
          {formaterHeure(currentTime)}
        </span>
      </div>
    </div>
  );
}