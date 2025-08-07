// Colombian shipping companies data and configurations

export const COLOMBIAN_CITIES = [
  // Major cities
  { code: "BOG", name: "Bogotá D.C.", department: "Cundinamarca" },
  { code: "MDE", name: "Medellín", department: "Antioquia" },
  { code: "CLO", name: "Cali", department: "Valle del Cauca" },
  { code: "BAQ", name: "Barranquilla", department: "Atlántico" },
  { code: "CTG", name: "Cartagena", department: "Bolívar" },
  { code: "CUC", name: "Cúcuta", department: "Norte de Santander" },
  { code: "PEI", name: "Pereira", department: "Risaralda" },
  { code: "IBE", name: "Ibagué", department: "Tolima" },
  { code: "BGA", name: "Bucaramanga", department: "Santander" },
  { code: "SMR", name: "Santa Marta", department: "Magdalena" },
  { code: "VVC", name: "Villavicencio", department: "Meta" },
  { code: "MZL", name: "Manizales", department: "Caldas" },
  { code: "PAL", name: "Palmira", department: "Valle del Cauca" },
  { code: "SOL", name: "Soledad", department: "Atlántico" },
  { code: "VAL", name: "Valledupar", department: "Cesar" }
];

export const COLOMBIAN_SHIPPING_COMPANIES = {
  ENVIA: {
    name: "Envia",
    code: "ENVIA",
    logo: "/logos/envia.png",
    website: "https://envia.co",
    services: [
      {
        code: "ENVIA_STANDARD",
        name: "Envío Terrestre",
        description: "Paquetes terrestres 1-8 kg",
        type: "weight_based",
        estimatedDays: 3,
        maxWeight: 8,
        maxDimensions: "45cm x 45cm x 45cm"
      },
      {
        code: "ENVIA_EXPRESS",
        name: "Envío Aéreo",
        description: "Paquetes aéreos 9-80 kg",
        type: "weight_based",
        estimatedDays: 1,
        maxWeight: 80,
        maxDimensions: "1m x 1m x 1m"
      },
      {
        code: "ENVIA_HEAVY",
        name: "Mercancía Terrestre",
        description: "Mercancía terrestre 9-200 kg",
        type: "weight_based",
        estimatedDays: 4,
        maxWeight: 200,
        maxDimensions: "4m x 2m x 2m"
      },
      {
        code: "ENVIA_COD",
        name: "Recaudo",
        description: "Envío con recaudo (contra entrega)",
        type: "price_based",
        estimatedDays: 3,
        hasRecaudo: true
      }
    ]
  },
  SERVIENTREGA: {
    name: "Servientrega",
    code: "SERVIENTREGA",
    logo: "/logos/servientrega.png",
    website: "https://servientrega.com",
    services: [
      {
        code: "SER_STANDARD",
        name: "Envío Nacional",
        description: "Servicio estándar nacional",
        type: "weight_based",
        estimatedDays: 2,
        maxWeight: 50
      },
      {
        code: "SER_EXPRESS",
        name: "Hoy Mismo",
        description: "Entrega el mismo día (ciudades principales)",
        type: "flat_rate",
        estimatedDays: 0,
        sameDayDelivery: true
      },
      {
        code: "SER_NEXT",
        name: "Próximo Día",
        description: "Entrega al siguiente día",
        type: "weight_based",
        estimatedDays: 1
      },
      {
        code: "SER_COD",
        name: "Contra Entrega",
        description: "Servicio contra entrega",
        type: "price_based",
        estimatedDays: 3,
        hasRecaudo: true
      }
    ]
  },
  COORDINADORA: {
    name: "Coordinadora",
    code: "COORDINADORA",
    logo: "/logos/coordinadora.png",
    website: "https://coordinadora.com",
    services: [
      {
        code: "COOR_STANDARD",
        name: "Estándar",
        description: "Envío estándar nacional",
        type: "weight_based",
        estimatedDays: 3,
        maxWeight: 70
      },
      {
        code: "COOR_EXPRESS",
        name: "Express",
        description: "Servicio express",
        type: "weight_based",
        estimatedDays: 1
      },
      {
        code: "COOR_SPECIAL",
        name: "Especial",
        description: "Paquetes especiales y voluminosos",
        type: "price_based",
        estimatedDays: 4
      }
    ]
  },
  INTERRAPIDISIMO: {
    name: "Interrapidisimo",
    code: "INTERRAPIDISIMO",
    logo: "/logos/interrapidisimo.png",
    website: "https://interrapidisimo.com",
    services: [
      {
        code: "INTER_STANDARD",
        name: "Envío Nacional",
        description: "Servicio nacional estándar",
        type: "weight_based",
        estimatedDays: 2,
        maxWeight: 50
      },
      {
        code: "INTER_EXPRESS",
        name: "Súper Inter",
        description: "Servicio express nacional",
        type: "weight_based",
        estimatedDays: 1
      },
      {
        code: "INTER_COD",
        name: "Contra Entrega",
        description: "Servicio contra entrega",
        type: "price_based",
        estimatedDays: 3,
        hasRecaudo: true
      }
    ]
  }
} as const;

// Colombian shipping zones based on geography and delivery complexity
export const COLOMBIAN_SHIPPING_ZONES = {
  ZONE_1: {
    name: "Zona 1 - Ciudades Principales",
    description: "Bogotá, Medellín, Cali, Barranquilla",
    cities: ["BOG", "MDE", "CLO", "BAQ"],
    baseRate: 1.0 // Multiplier for base rates
  },
  ZONE_2: {
    name: "Zona 2 - Ciudades Intermedias",
    description: "Cartagena, Cúcuta, Pereira, Bucaramanga",
    cities: ["CTG", "CUC", "PEI", "BGA", "SMR", "IBE"],
    baseRate: 1.2
  },
  ZONE_3: {
    name: "Zona 3 - Otras Ciudades",
    description: "Resto de municipios",
    cities: ["VVC", "MZL", "PAL", "SOL", "VAL"],
    baseRate: 1.5
  }
} as const;

// Base shipping rates in Colombian Pesos (COP)
export const COLOMBIAN_BASE_RATES = {
  WEIGHT_TIERS: [
    { maxWeight: 1, price: 8000 },     // Up to 1kg: $8,000 COP
    { maxWeight: 3, price: 12000 },    // 1-3kg: $12,000 COP  
    { maxWeight: 5, price: 16000 },    // 3-5kg: $16,000 COP
    { maxWeight: 10, price: 22000 },   // 5-10kg: $22,000 COP
    { maxWeight: 20, price: 35000 },   // 10-20kg: $35,000 COP
    { maxWeight: 50, price: 50000 },   // 20-50kg: $50,000 COP
    { maxWeight: Infinity, price: 80000 } // 50kg+: $80,000 COP
  ],
  EXPRESS_MULTIPLIER: 1.5,   // 50% more for express
  COD_PERCENTAGE: 0.02,      // 2% for cash on delivery
  MIN_COD_FEE: 3000          // Minimum COD fee: $3,000 COP
};

export function calculateColombianShipping(
  weight: number,
  declaredValue: number,
  originZone: string,
  destinationZone: string,
  serviceType: string,
  hasRecaudo: boolean = false
): number {
  // Find weight tier
  const weightTier = COLOMBIAN_BASE_RATES.WEIGHT_TIERS.find(
    tier => weight <= tier.maxWeight
  );
  
  if (!weightTier) {
    throw new Error("Weight exceeds maximum limits");
  }

  let basePrice = weightTier.price;

  // Apply zone multiplier (assuming destination zone affects pricing)
  const zoneMultiplier = COLOMBIAN_SHIPPING_ZONES[destinationZone as keyof typeof COLOMBIAN_SHIPPING_ZONES]?.baseRate || 1.0;
  basePrice *= zoneMultiplier;

  // Apply service type multiplier
  if (serviceType.includes("EXPRESS") || serviceType.includes("SUPER")) {
    basePrice *= COLOMBIAN_BASE_RATES.EXPRESS_MULTIPLIER;
  }

  // Add COD fee if applicable
  if (hasRecaudo) {
    const codFee = Math.max(
      declaredValue * COLOMBIAN_BASE_RATES.COD_PERCENTAGE,
      COLOMBIAN_BASE_RATES.MIN_COD_FEE
    );
    basePrice += codFee;
  }

  return Math.round(basePrice);
}

// Helper function to get zone by city code
export function getCityZone(cityCode: string): string {
  for (const [zoneKey, zone] of Object.entries(COLOMBIAN_SHIPPING_ZONES)) {
    if (zone.cities.includes(cityCode)) {
      return zoneKey;
    }
  }
  return "ZONE_3"; // Default to most expensive zone
}

// Helper to format Colombian Peso
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}