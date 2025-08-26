export const bodySegmentCategories = {
  cabeza: {
    name: 'Cabeza y Cuello',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=60',
    subsections: {
      cerebro: {
        name: 'Cerebro y Sistema Nervioso',
        scales: ['glasgow', 'mmse'],
      },
      facial: {
        name: 'Región Facial',
        scales: ['house-brackmann'],
      },
    },
  },
  tronco: {
    name: 'Tronco',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60',
    subsections: {
      columna: {
        name: 'Columna Vertebral',
        scales: ['oswestry'],
      },
      torax: {
        name: 'Tórax',
        scales: ['borg'],
      },
    },
  },
  extremidades_superiores: {
    name: 'Extremidades Superiores',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    subsections: {
      hombro: {
        name: 'Hombro',
        scales: ['constant'],
      },
    },
  },
  extremidades_inferiores: {
    name: 'Extremidades Inferiores',
    image: 'https://images.unsplash.com/photo-1576091160291-258524ab6322?w=800&auto=format&fit=crop&q=60',
    subsections: {
      extremidades: {
        name: 'Extremidades',
        scales: ['harris', 'constant', 'koos', 'lequesne-rodilla-es-v1'],
      },
    },
  },
};
