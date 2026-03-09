// Delade färgkonstanter och kategorier för hela applikationen

export const categoryColors: Record<string, string> = {
  "Styrning & Demokrati": "bg-blue-100 text-blue-700 border-blue-200",
  "Digitalisering & Teknik": "bg-purple-100 text-purple-700 border-purple-200",
  "Välfärd & Omsorg": "bg-pink-100 text-pink-700 border-pink-200",
  "Utbildning & Kompetens": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Klimat, Miljö & Samhällsbyggnad": "bg-teal-100 text-teal-700 border-teal-200",
  "Trygghet & Beredskap": "bg-slate-100 text-slate-700 border-slate-200",
  "Ekonomi & Resurser": "bg-amber-100 text-amber-700 border-amber-200",
  "Arbetsgivare & Organisation": "bg-orange-100 text-orange-700 border-orange-200",
  "Samhälle & Medborgare": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Innovation & Omställning": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

export const paverkanColors: Record<string, string> = {
  "Direkt reglering": "bg-red-100 text-red-700 border-red-200",
  "Indirekt påverkan": "bg-orange-100 text-orange-700 border-orange-200",
  "Möjlighet": "bg-green-100 text-green-700 border-green-200",
  "Risk/hot": "bg-rose-100 text-rose-700 border-rose-200",
};

export const atgardColors: Record<string, string> = {
  "Agera nu": "bg-red-100 text-red-700 border-red-200",
  Planera: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Bevaka: "bg-blue-100 text-blue-700 border-blue-200",
  Inspireras: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const tidshorisontColors: Record<string, string> = {
  "Akut (0-3 mån)": "bg-red-50 text-red-600 border-red-200",
  "Kort sikt (3-12 mån)": "bg-orange-50 text-orange-600 border-orange-200",
  "Medellång sikt (1-3 år)": "bg-blue-50 text-blue-600 border-blue-200",
  "Lång sikt (3+ år)": "bg-slate-50 text-slate-600 border-slate-200",
};

export const impactColors: Record<string, string> = {
  KRITISK: "bg-red-100 text-red-700 border-red-200",
  HÖG: "bg-orange-100 text-orange-700 border-orange-200",
  MEDEL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LÅG: "bg-green-100 text-green-700 border-green-200",
};

export const impactCardColors: Record<string, string> = {
  KRITISK: "border-l-red-500",
  HÖG: "border-l-orange-500",
  MEDEL: "border-l-yellow-500",
  LÅG: "border-l-green-500",
};

export const frameworkColors: Record<string, string> = {
  "WEF Global Risks": "bg-blue-100 text-blue-700 border-blue-200",
  "Kairos Future TAIDA": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "DIGG/eSam": "bg-purple-100 text-purple-700 border-purple-200",
};

export const roleColors: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  editor: "bg-purple-100 text-purple-700 border-purple-200",
  viewer: "bg-slate-100 text-slate-700 border-slate-200",
};

export const statusLabels: Record<string, string> = {
  ej_paborjad: "Ej påbörjad",
  pagaende: "Pågående",
  klar: "Klar",
};

export const statusColors: Record<string, string> = {
  ej_paborjad: "bg-slate-100 text-slate-700 border-slate-200",
  pagaende: "bg-blue-100 text-blue-700 border-blue-200",
  klar: "bg-green-100 text-green-700 border-green-200",
};

export const priorityColors: Record<string, string> = {
  Hög: "text-red-600",
  Medel: "text-orange-600",
  Låg: "text-green-600",
};

export const categories = [
  "Alla",
  "Styrning & Demokrati",
  "Digitalisering & Teknik",
  "Välfärd & Omsorg",
  "Utbildning & Kompetens",
  "Klimat, Miljö & Samhällsbyggnad",
  "Trygghet & Beredskap",
  "Ekonomi & Resurser",
  "Arbetsgivare & Organisation",
  "Samhälle & Medborgare",
  "Innovation & Omställning",
];
