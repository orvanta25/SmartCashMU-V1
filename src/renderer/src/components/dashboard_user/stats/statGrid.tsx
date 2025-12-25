'use client';

import { StatCard } from './statCard';

export function StatGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard 
        title="Commandes totales" 
        value="24"
      />
      <StatCard 
        title="En cours" 
        value="3"
      />
      <StatCard 
        title="Montant total" 
        value="110dt"
      />
    </div>
  );
}