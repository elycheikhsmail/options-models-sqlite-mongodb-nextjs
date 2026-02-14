"use client"; 
import { useEffect, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";

const baseApiEnv = process.env.NEXT_PUBLIC_BASE_API||"";
const baseApi = baseApiEnv.endsWith("/") ? baseApiEnv : `${baseApiEnv}/`;

type LieuOption = {
  id: number;
  name: string;
  nameAr: string | null;
  priority: number;
  tag: string | null;
  depth: number;
  parentID: number | null;
};

export default function Home() {
  // États pour les données et sélections de chaque colonne
  const [columns, setColumns] = useState<LieuOption[][]>([[], [], [], [], []]);
  const columnsNames = [
    "Wilaya",
    "Moughataa",
    "sous-categorie",
    "options",
    "sous-options",
  ]
  const [selected, setSelected] = useState<Array<number | null>>([null, null, null, null, null]);
  // État pour la modale d'ajout
  const [modal, setModal] = useState<{ open: boolean; parentID: number | null; parentDepth: number }>({ open: false, parentID: null, parentDepth: 0 });
  // États du formulaire
  const [form, setForm] = useState({ name: "", nameAr: "", priority: 1, tag: "" });
  const [loading, setLoading] = useState(false);
  // État pour la modale d'édition
  const [editModal, setEditModal] = useState<{ open: boolean; option: LieuOption | null; colIdx: number }>({ open: false, option: null, colIdx: 0 });
  const [editForm, setEditForm] = useState({ name: "", nameAr: "", priority: 1, tag: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Chargement initial : options de depth = 1
  useEffect(() => {
    fetch(`${baseApi}lieux`)
      .then((res) => res.json())
      .then((data) => {
        setColumns([data, [], [], [], []]);
      });
  }, []);

  // Gestion du clic sur une option
  const handleSelect = (colIdx: number, option: LieuOption) => {
    // Met à jour la sélection
    const newSelected = [...selected];
    newSelected[colIdx] = option.id;
    // Vide les sélections et données des colonnes suivantes
    for (let i = colIdx + 1; i < 5; i++) {
      newSelected[i] = null;
    }
    setSelected(newSelected);
    // Charge les enfants pour la colonne suivante
    fetch(`${baseApi}lieux?parentId=${option.id}`)
      .then((res) => res.json())
      .then((data) => {
        const newColumns = [...columns];
        newColumns[colIdx + 1] = data;
        // Vide les colonnes suivantes
        for (let i = colIdx + 2; i < 5; i++) {
          newColumns[i] = [];
        }
        setColumns(newColumns);
      });
  };

  // Gestion du clic sur le bouton +
  const handleAddClick = (parentID: number | null, parentDepth: number) => {
    setModal({ open: true, parentID, parentDepth });
    setForm({ name: "", nameAr: "", priority: 1, tag: "" });
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setLoading(true);
    const depth = (modal.parentDepth ?? 0) + 1;
    const parentID = modal.parentID;
    const res = await fetch(`${baseApi}lieux`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, depth, parentID }),
    });
    setLoading(false);
    if (res.ok) {
      setModal({ open: false, parentID: null, parentDepth: 0 });
      setForm({ name: "", nameAr: "", priority: 1, tag: "" });
      // Rafraîchir la colonne enfant
      if (typeof parentID === "number") {
        fetch(`${baseApi}lieux?parentId=${parentID}`)
          .then((r) => r.json())
          .then((data) => {
            const newColumns = [...columns];
            newColumns[modal.parentDepth] = data;
            for (let i = modal.parentDepth + 1; i < 5; i++) newColumns[i] = [];
            setColumns(newColumns);
          });
      } else {
        // Ajout racine
        fetch(baseApi)
          .then((r) => r.json())
          .then((data) => {
            const newColumns = [...columns];
            newColumns[0] = data;
            for (let i = 1; i < 5; i++) newColumns[i] = [];
            setColumns(newColumns);
          });
      }
    }
  };

  // Ouvre la modale d'édition avec les données de l'option
  const handleEditClick = (option: LieuOption, colIdx: number) => {
    setEditModal({ open: true, option, colIdx });
    setEditForm({
      name: option.name || "",
      nameAr: option.nameAr || "",
      priority: option.priority || 1,
      tag: option.tag || "",
    });
  };

  // Soumission du formulaire d'édition
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.option) return;
    setEditLoading(true);
    const { id, depth, parentID } = editModal.option;
    const res = await fetch(`${baseApi}lieux/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, depth, parentID }),
    });
    setEditLoading(false);
    if (res.ok) {
      setEditModal({ open: false, option: null, colIdx: 0 });
      // Rafraîchir la colonne courante
      if (typeof parentID === "number") {
        fetch(`${baseApi}lieux?parentId=${parentID}`)
          .then((r) => r.json())
          .then((data) => {
            const newColumns = [...columns];
            newColumns[editModal.colIdx] = data;
            for (let i = editModal.colIdx + 1; i < 5; i++) newColumns[i] = [];
            setColumns(newColumns);
          });
      } else {
        // Racine
        fetch(baseApi)
          .then((r) => r.json())
          .then((data) => {
            const newColumns = [...columns];
            newColumns[0] = data;
            for (let i = 1; i < 5; i++) newColumns[i] = [];
            setColumns(newColumns);
          });
      }
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8"> Lieux - Administration</h1>
      <div className="flex w-full max-w-6xl gap-4">
        {columns.map((colData, colIdx) => (
          <div
            key={colIdx}
            className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col"
          >
            <h2 className="text-lg font-semibold mb-4 text-center">
              {/* Niveau {colIdx + 1} */}
               {columnsNames[colIdx]}
            </h2>
            <div className="flex-1 min-h-[200px] flex flex-col gap-2 items-stretch justify-start">
              {colData.length === 0 ? (
                <div className="text-gray-400 text-center">Aucune donnée</div>
              ) : (
                colData.map((option: LieuOption) => (
                  <div
                    key={option.id}
                    className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${selected[colIdx] === option.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
                    onClick={() => handleSelect(colIdx, option)}
                  >
                    <span>{option.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        className="text-blue-500 hover:text-blue-700 text-lg font-bold px-2"
                        title="Ajouter une sous-option"
                        onClick={e => { e.stopPropagation(); handleAddClick(option.id, option.depth); }}
                      >
                        +
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700 text-lg px-2"
                        title="Actualiser cette option"
                        onClick={e => { e.stopPropagation(); handleEditClick(option, colIdx); }}
                      >
                        <FaSyncAlt />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Ajout racine */}
            {colIdx === 0 && (
              <button
                className="mt-4 text-green-600 hover:text-green-800 font-bold border border-green-200 rounded px-2 py-1"
                onClick={() => handleAddClick(null, 0)}
              >
                + Ajouter une option racine
              </button>
            )}
          </div>
        ))}
      </div>
      {/* Modale d'ajout */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setModal({ open: false, parentID: null, parentDepth: 0 })}>&times;</button>
            <h3 className="text-lg font-semibold mb-4">Ajouter une option</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                className="border rounded px-2 py-1"
                placeholder="Nom (obligatoire)"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="Nom arabe"
                value={form.nameAr}
                onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="Tag"
                value={form.tag}
                onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
              />
              <input
                className="border rounded px-2 py-1"
                type="number"
                min={1}
                placeholder="Priorité (défaut 1)"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded px-4 py-2 mt-2 hover:bg-blue-700 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Ajout..." : "Ajouter"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modale d'édition */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setEditModal({ open: false, option: null, colIdx: 0 })}>&times;</button>
            <h3 className="text-lg font-semibold mb-4">Actualiser l&apos;option</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <input
                className="border rounded px-2 py-1"
                placeholder="Nom (obligatoire)"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="Nom arabe"
                value={editForm.nameAr}
                onChange={e => setEditForm(f => ({ ...f, nameAr: e.target.value }))}
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="Tag"
                value={editForm.tag}
                onChange={e => setEditForm(f => ({ ...f, tag: e.target.value }))}
              />
              <input
                className="border rounded px-2 py-1"
                type="number"
                min={1}
                placeholder="Priorité (défaut 1)"
                value={editForm.priority}
                onChange={e => setEditForm(f => ({ ...f, priority: Number(e.target.value) }))}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded px-4 py-2 mt-2 hover:bg-blue-700 disabled:opacity-60"
                disabled={editLoading}
              >
                {editLoading ? "Mise à jour..." : "Actualiser"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
