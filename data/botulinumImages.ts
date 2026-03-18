// data/botulinumImages.ts
// Base de datos de imágenes para puntos motores de músculos

export interface MusculoImage {
  url: string;
  alt: string;
  description?: string;
  anatomicalRegion: string;
}

export const musculoImages: Record<string, MusculoImage> = {
  "Dorsal ancho": {
    url: "https://static.wixstatic.com/media/fc5d1a_75aec5dbeead45269019caa690b03ded~mv2.png",
    alt: "Anatomía del músculo dorsal ancho - punto motor para toxina botulínica",
    description: "Ilustración anatómica del músculo dorsal ancho mostrando la localización del punto motor para inyección de toxina botulínica",
    anatomicalRegion: "Tronco"
  },
  // Aquí se pueden agregar más imágenes en el futuro
  // "Deltoides": {
  //   url: "...",
  //   alt: "Anatomía del músculo deltoides",
  //   description: "...",
  //   anatomicalRegion: "Miembro Superior"
  // },
};

// Función para obtener la imagen de un músculo
export const getMusculoImage = (nombreMusculo: string): MusculoImage | null => {
  return musculoImages[nombreMusculo] || null;
};

// Función para verificar si un músculo tiene imagen disponible
export const hasMusculoImage = (nombreMusculo: string): boolean => {
  return nombreMusculo in musculoImages;
};
