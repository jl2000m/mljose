// ADEN brand colors (use for charts and any inline styles)
export const ADEN_COLORS = {
  red: "#E12B26",
  redLight: "rgb(254, 202, 202)",
  green: "#34C759",
  greenLight: "rgb(167, 243, 208)",
  grey: "rgb(226, 232, 240)",
} as const;

export const ROUTES = {
  home: "/",
  analisis: "/analisis",
  modelo: "/modelo",
  predictor: "/predictor",
} as const;

export const NAV_LINKS = [
  { href: ROUTES.home, label: "Inicio" },
  { href: ROUTES.analisis, label: "Análisis" },
  { href: ROUTES.modelo, label: "Modelo" },
  { href: ROUTES.predictor, label: "Predictor" },
] as const;

export const STUDENT = {
  name: "Jose Luis Martinez Villegas",
  passport: "164992615",
  institution: "ADEN Business School",
};

export const NUMERIC_COLS = [
  "price",
  "minimum_nights",
  "number_of_reviews",
  "reviews_per_month",
  "availability_365",
  "calculated_host_listings_count",
] as const;

export const ROOM_TYPES = [
  "Entire home/apt",
  "Private room",
  "Shared room",
  "Hotel room",
] as const;
