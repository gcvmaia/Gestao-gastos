// Paleta de cores pré-definida pro seletor de cor de categoria (ColorPicker).
// Curada pra funcionar bem tanto nos badges quanto nas fatias do donut do Resumo.
export const PALETA_CORES_CATEGORIA = [
  "#0F3D30", // verde profundo (mesma cor da sidebar/card de destaque)
  "#1D9E75", // verde médio
  "#2B3B34", // verde-acinzentado escuro
  "#2563EB", // azul
  "#7C3AED", // roxo
  "#DB2777", // rosa
  "#DC2626", // vermelho
  "#EA580C", // laranja
  "#CA8A04", // amarelo-ouro
  "#0891B2", // ciano
] as const;

// Grid curado de ícones lucide-react pro seletor de ícone de subcategoria.
// Nomes literais de export do lucide-react — usados como chave em IconPicker/StatusFlag.
export const ICONES_SUBCATEGORIA = [
  "ShoppingCart",
  "Utensils",
  "Coffee",
  "Car",
  "Fuel",
  "Bus",
  "Home",
  "Lightbulb",
  "Wifi",
  "Phone",
  "Plane",
  "Hotel",
  "Heart",
  "Stethoscope",
  "Pill",
  "GraduationCap",
  "BookOpen",
  "Gamepad2",
  "Film",
  "Music",
  "Shirt",
  "Gift",
  "Dog",
  "Baby",
  "Wrench",
  "CreditCard",
  "PiggyBank",
  "Landmark",
  "Repeat",
  "MoreHorizontal",
] as const;

export type IconeSubcategoria = (typeof ICONES_SUBCATEGORIA)[number];
