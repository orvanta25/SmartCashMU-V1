'use client';

import React, { useState } from 'react';
import { CategoryTableProps } from './types';

export const CategoryTable: React.FC<CategoryTableProps> = ({ 
  categories, 
  error,
  onUpdateCategory,
  onDeleteCategory,
  page,
  totalPages,
  onPageChange
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingShowInPos, setEditingShowInPos] = useState<boolean>(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleEdit = (category: { id: string; nom: string; showInPos: boolean }) => {
    setEditingId(category.id);
    setEditingName(category.nom);
    setEditingShowInPos(category.showInPos);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName('');
    setEditingShowInPos(true);
  };

  const handleSave = async (id: string) => {
    try {
      setUpdating(true);
      await onUpdateCategory(id, editingName, editingShowInPos);
      setEditingId(null);
    } catch (error) {
      // Error handled by parent
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      await onDeleteCategory(id);
    } catch (error) {
      // Error handled by parent
    } finally {
      setDeleting(null);
    }
  };

  if (error) {
    return <div className="text-center py-8 text-red-400">{error}</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        Aucune catégorie disponible.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] sm:table hidden">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Nom</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Affichage POS</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Date de création</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-white/80">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-white/80">
                {editingId === category.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition"
                    disabled={updating}
                    autoFocus
                  />
                ) : (
                  <span className="text-white/90">{category.nom}</span>
                )}
              </td>
              <td className="px-6 py-4 text-white/80 relative overflow-visible">
                {editingId === category.id ? (
                  <div className="relative">
                    <select
                      value={editingShowInPos ? 'Oui' : 'Non'}
                      onChange={(e) => setEditingShowInPos(e.target.value === 'Oui')}
                      className="w-full appearance-none pl-3 pr-9 py-2 bg-[#2b1b5b] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition"
                      disabled={updating}
                    >
                      <option value="Oui">Oui</option>
                      <option value="Non">Non</option>
                    </select>
                    <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                ) : (
                  <span className={category.showInPos ? 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-300 border border-green-400/20' : 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-300 border border-red-400/20'}>
                    {category.showInPos ? 'Oui' : 'Non'}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-white/60">
                {new Date(category.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {editingId === category.id ? (
                  <>
                    <button
                      onClick={() => handleSave(category.id)}
                      disabled={updating}
                      className="px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 shadow-sm"
                    >
                      {updating ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={updating}
                      className="px-3 py-1.5 rounded-md border border-white/10 text-white/80 hover:bg-white/5"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(category)}
                      className="px-3 py-1.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-400/20 hover:bg-blue-500/25"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={deleting === category.id}
                      className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-300 border border-red-400/20 hover:bg-red-500/20 disabled:opacity-60"
                    >
                      {deleting === category.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sm:hidden space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white/[0.04] p-4 rounded-lg border border-white/10 shadow-sm">
            <div className="mb-2">
              <span className="text-white/60 text-sm">Nom :</span><br />
              {editingId === category.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition"
                  disabled={updating}
                  autoFocus
                />
              ) : (
                <p className="text-white mt-1">{category.nom}</p>
              )}
            </div>
            <div className="mb-2">
              <span className="text-white/60 text-sm">Affichage POS :</span><br />
              {editingId === category.id ? (
                <div className="relative mt-1">
                  <select
                    value={editingShowInPos ? 'Oui' : 'Non'}
                    onChange={(e) => setEditingShowInPos(e.target.value === 'Oui')}
                    className="w-full appearance-none pl-3 pr-9 py-2 bg-[#2b1b5b] border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition"
                    disabled={updating}
                  >
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                  <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              ) : (
                <p className="mt-1">
                  <span className={category.showInPos ? 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-300 border border-green-400/20' : 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-300 border border-red-400/20'}>
                    {category.showInPos ? 'Oui' : 'Non'}
                  </span>
                </p>
              )}
            </div>
            <div className="mb-2">
              <span className="text-white/60 text-sm">Date de création :</span><br />
              <p className="text-white mt-1">{new Date(category.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              {editingId === category.id ? (
                <>
                  <button
                    onClick={() => handleSave(category.id)}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 shadow-sm"
                  >
                    {updating ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="px-3 py-1.5 rounded-md border border-white/10 text-white/80 hover:bg-white/5"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-3 py-1.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-400/20 hover:bg-blue-500/25"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
                    className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-300 border border-red-400/20 hover:bg-red-500/20 disabled:opacity-60"
                  >
                    {deleting === category.id ? 'Suppression...' : 'Supprimer'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 px-6 py-4 border-t border-white/10">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 text-white rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-sm"
        >
          Précédent
        </button>
        <span className="text-white">
          Page {page} sur {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 text-white rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-sm"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};