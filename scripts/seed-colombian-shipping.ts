#!/usr/bin/env tsx

import { db } from "@/db";
import { stores, shippingZones, shippingRates, shippingMethods } from "@/db/schemas";
import { COLOMBIAN_SHIPPING_COMPANIES, COLOMBIAN_SHIPPING_ZONES } from "@/lib/colombian-shipping";
import { eq } from "drizzle-orm";

async function seedColombianShipping() {
  try {
    console.log("🇨🇴 Starting Colombian shipping data seeding...");

    // Get all stores to add shipping zones and methods
    const allStores = await db.select().from(stores);
    
    if (allStores.length === 0) {
      console.log("⚠️ No stores found. Please create stores first.");
      return;
    }

    for (const store of allStores) {
      console.log(`\n🏪 Setting up shipping for store: ${store.name}`);

      // Create Colombian shipping zones
      const createdZones = await Promise.all([
        // Zone 1 - Major cities
        db.insert(shippingZones).values({
          name: "Colombia - Ciudades Principales",
          storeId: store.id,
          countries: ["CO"],
          states: ["Cundinamarca", "Antioquia", "Valle del Cauca", "Atlántico"],
          postalCodes: null, // We'll use cities instead of postal codes
          isActive: true
        }).returning(),

        // Zone 2 - Intermediate cities  
        db.insert(shippingZones).values({
          name: "Colombia - Ciudades Intermedias",
          storeId: store.id,
          countries: ["CO"],
          states: ["Bolívar", "Norte de Santander", "Risaralda", "Santander", "Magdalena", "Tolima"],
          postalCodes: null,
          isActive: true
        }).returning(),

        // Zone 3 - Other cities
        db.insert(shippingZones).values({
          name: "Colombia - Otras Ciudades",
          storeId: store.id,
          countries: ["CO"],
          states: ["Meta", "Caldas", "Cesar"],
          postalCodes: null,
          isActive: true
        }).returning()
      ]);

      const [zone1, zone2, zone3] = createdZones.map(z => z[0]);

      // Create shipping rates for each zone
      const ratePromises = [];

      // Zone 1 rates (Major cities)
      ratePromises.push(
        // Envia rates
        db.insert(shippingRates).values({
          name: "Envia - Terrestre",
          description: "Paquetes terrestres 1-8kg, entrega en 3 días",
          zoneId: zone1.id,
          type: "weight_based",
          price: "8000",
          minWeight: "0",
          maxWeight: "8",
          estimatedDays: 3,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Envia - Aéreo Express",
          description: "Paquetes aéreos 9-80kg, entrega en 1 día",
          zoneId: zone1.id,
          type: "weight_based", 
          price: "25000",
          minWeight: "0",
          maxWeight: "80",
          estimatedDays: 1,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Envia - Con Recaudo",
          description: "Envío con recaudo contra entrega",
          zoneId: zone1.id,
          type: "price_based",
          price: "12000",
          minPrice: "10000",
          maxPrice: "500000",
          estimatedDays: 3,
          isActive: true
        }),

        // Servientrega rates
        db.insert(shippingRates).values({
          name: "Servientrega - Nacional",
          description: "Servicio estándar nacional",
          zoneId: zone1.id,
          type: "weight_based",
          price: "9000",
          minWeight: "0",
          maxWeight: "50",
          estimatedDays: 2,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Servientrega - Hoy Mismo",
          description: "Entrega el mismo día en ciudades principales",
          zoneId: zone1.id,
          type: "flat_rate",
          price: "35000",
          estimatedDays: 0,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Servientrega - Contra Entrega",
          description: "Servicio contra entrega",
          zoneId: zone1.id,
          type: "price_based",
          price: "15000",
          minPrice: "20000",
          maxPrice: "1000000",
          estimatedDays: 3,
          isActive: true
        }),

        // Coordinadora rates
        db.insert(shippingRates).values({
          name: "Coordinadora - Estándar",
          description: "Envío estándar nacional",
          zoneId: zone1.id,
          type: "weight_based",
          price: "10000",
          minWeight: "0",
          maxWeight: "70",
          estimatedDays: 3,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Coordinadora - Express",
          description: "Servicio express",
          zoneId: zone1.id,
          type: "weight_based",
          price: "18000",
          minWeight: "0",
          maxWeight: "70",
          estimatedDays: 1,
          isActive: true
        }),

        // Interrapidisimo rates
        db.insert(shippingRates).values({
          name: "Interrapidisimo - Nacional",
          description: "Servicio nacional estándar",
          zoneId: zone1.id,
          type: "weight_based",
          price: "8500",
          minWeight: "0",
          maxWeight: "50",
          estimatedDays: 2,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Interrapidisimo - Súper Inter",
          description: "Servicio express nacional",
          zoneId: zone1.id,
          type: "weight_based",
          price: "16000",
          minWeight: "0", 
          maxWeight: "50",
          estimatedDays: 1,
          isActive: true
        })
      );

      // Zone 2 rates (Intermediate cities) - 20% more expensive
      ratePromises.push(
        db.insert(shippingRates).values({
          name: "Envia - Terrestre",
          description: "Paquetes terrestres a ciudades intermedias",
          zoneId: zone2.id,
          type: "weight_based",
          price: "9600", // 20% more
          minWeight: "0",
          maxWeight: "8",
          estimatedDays: 4,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Servientrega - Nacional",
          description: "Servicio a ciudades intermedias",
          zoneId: zone2.id,
          type: "weight_based",
          price: "10800", // 20% more
          minWeight: "0",
          maxWeight: "50",
          estimatedDays: 3,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Coordinadora - Estándar",
          description: "Envío a ciudades intermedias",
          zoneId: zone2.id,
          type: "weight_based",
          price: "12000", // 20% more
          minWeight: "0",
          maxWeight: "70",
          estimatedDays: 4,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Interrapidisimo - Nacional",
          description: "Servicio a ciudades intermedias",
          zoneId: zone2.id,
          type: "weight_based",
          price: "10200", // 20% more
          minWeight: "0",
          maxWeight: "50",
          estimatedDays: 3,
          isActive: true
        })
      );

      // Zone 3 rates (Other cities) - 50% more expensive
      ratePromises.push(
        db.insert(shippingRates).values({
          name: "Envia - Terrestre",
          description: "Paquetes terrestres a otras ciudades",
          zoneId: zone3.id,
          type: "weight_based",
          price: "12000", // 50% more
          minWeight: "0",
          maxWeight: "8",
          estimatedDays: 5,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Servientrega - Nacional",
          description: "Servicio a otras ciudades",
          zoneId: zone3.id,
          type: "weight_based",
          price: "13500", // 50% more
          minWeight: "0",
          maxWeight: "50",
          estimatedDays: 4,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Coordinadora - Estándar",
          description: "Envío a otras ciudades",
          zoneId: zone3.id,
          type: "weight_based",
          price: "15000", // 50% more
          minWeight: "0",
          maxWeight: "70",
          estimatedDays: 5,
          isActive: true
        }),
        db.insert(shippingRates).values({
          name: "Interrapidisimo - Nacional", 
          description: "Servicio a otras ciudades",
          zoneId: zone3.id,
          type: "weight_based",
          price: "12750", // 50% more
          minWeight: "0",
          maxWeight: "50",
          estimatedDays: 4,
          isActive: true
        })
      );

      // Create all rates
      await Promise.all(ratePromises);

      // Create shipping methods for tracking
      await Promise.all([
        db.insert(shippingMethods).values({
          name: "Envia",
          carrier: "Envia",
          code: "ENVIA",
          trackingUrlTemplate: "https://envia.co/tracking?guia={tracking_number}",
          storeId: store.id,
          isActive: true
        }),
        db.insert(shippingMethods).values({
          name: "Servientrega",
          carrier: "Servientrega",
          code: "SERVIENTREGA", 
          trackingUrlTemplate: "https://servientrega.com/rastro?tracking={tracking_number}",
          storeId: store.id,
          isActive: true
        }),
        db.insert(shippingMethods).values({
          name: "Coordinadora",
          carrier: "Coordinadora Mercantil S.A.",
          code: "COORDINADORA",
          trackingUrlTemplate: "https://coordinadora.com/seguimiento/?guia={tracking_number}",
          storeId: store.id,
          isActive: true
        }),
        db.insert(shippingMethods).values({
          name: "Interrapidisimo",
          carrier: "Interrapidisimo S.A.",
          code: "INTERRAPIDISIMO",
          trackingUrlTemplate: "https://interrapidisimo.com/tracking?numero={tracking_number}",
          storeId: store.id,
          isActive: true
        })
      ]);

      console.log(`✅ Successfully set up Colombian shipping for ${store.name}`);
      console.log(`   - Created 3 shipping zones`);
      console.log(`   - Created ${ratePromises.length} shipping rates`);
      console.log(`   - Created 4 shipping methods`);
    }

    console.log("\n🎉 Colombian shipping data seeding completed!");
    console.log("\nShipping companies configured:");
    console.log("• Envia - Terrestrial and air packages, cash on delivery");
    console.log("• Servientrega - Standard and same-day delivery");  
    console.log("• Coordinadora - Standard and express services");
    console.log("• Interrapidisimo - National and express services");
    
  } catch (error) {
    console.error("❌ Error seeding Colombian shipping data:", error);
    throw error;
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedColombianShipping()
    .then(() => {
      console.log("✅ Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedColombianShipping };