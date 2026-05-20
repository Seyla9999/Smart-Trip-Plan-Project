export type ProvinceMapArea = {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]];
};

export const provinceMapAreas: Record<string, ProvinceMapArea> = {
  "koh-kong": {
    center: [11.617, 102.983],
    zoom: 10,
    bounds: [
      [11.15, 102.45],
      [12.05, 103.45],
    ],
  },
  "siem-reap": {
    center: [13.367, 103.844],
    zoom: 10,
    bounds: [
      [13.05, 103.45],
      [13.75, 104.15],
    ],
  },
  kampot: {
    center: [10.61, 104.181],
    zoom: 10,
    bounds: [
      [10.2, 103.95],
      [10.95, 104.45],
    ],
  },
  kratie: {
    center: [12.488, 106.018],
    zoom: 10,
    bounds: [
      [12.1, 105.75],
      [12.85, 106.3],
    ],
  },
  kep: {
    center: [10.492, 104.299],
    zoom: 13,
    bounds: [
      [10.41, 104.24],
      [10.54, 104.36],
    ],
  },
  "preah-sihanouk": {
    center: [10.625, 103.523],
    zoom: 10,
    bounds: [
      [10.35, 103.2],
      [10.9, 103.9],
    ],
  },
  ratanakiri: {
    center: [13.739, 106.987],
    zoom: 9,
    bounds: [
      [13.25, 106.45],
      [14.15, 107.45],
    ],
  },
  mondulkiri: {
    center: [12.458, 107.2],
    zoom: 9,
    bounds: [
      [12.0, 106.75],
      [12.95, 107.75],
    ],
  },
  battambang: {
    center: [13.095, 103.202],
    zoom: 10,
    bounds: [
      [12.7, 102.85],
      [13.45, 103.55],
    ],
  },
  "phnom-penh": {
    center: [11.556, 104.928],
    zoom: 12,
    bounds: [
      [11.42, 104.78],
      [11.68, 105.08],
    ],
  },
  "preah-vihear": {
    center: [13.792, 104.98],
    zoom: 9,
    bounds: [
      [13.35, 104.45],
      [14.2, 105.45],
    ],
  },
  takeo: {
    center: [10.99, 104.785],
    zoom: 10,
    bounds: [
      [10.6, 104.45],
      [11.35, 105.05],
    ],
  },
  "kampong-speu": {
    center: [11.453, 104.524],
    zoom: 10,
    bounds: [
      [11.05, 104.15],
      [11.85, 104.9],
    ],
  },
};
