'use client';

export function ProfileSection() {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-medium text-white">Profile</h3>
      <div className="space-y-2">
        <button className="w-full text-left px-4 py-2 text-white/80 hover:bg-white/5 rounded-lg transition-colors">
          Voir le profil
        </button>
        <button className="w-full text-left px-4 py-2 text-white/80 hover:bg-white/5 rounded-lg transition-colors">
          Modifier le profil
        </button>
      </div>
    </div>
  );
}