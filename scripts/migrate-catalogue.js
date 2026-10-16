const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const sa = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const CATALOGUE_CATEGORIES = [
  "Female Haircut",
  "Male Haircut & Grooming",
  "Wax",
  "Hair Spa",
  "Treatment",
  "Other Hair & Skin Treatments",
  "Hair Colour",
  "Hand & Feet",
  "Head Massage",
  "Machine Treatment",
  "Clean Up",
  "Facial",
  "D-Tan",
];

const NEW_CATALOGUE = [
  // Category A: Female Haircut (13 services)
  { category: "Female Haircut", name: "Hair Wash & Styling", price: 250, durationMin: 30, gender: "female" },
  { category: "Female Haircut", name: "Ironing", price: 400, durationMin: 30, gender: "female" },
  { category: "Female Haircut", name: "Tong", price: 400, durationMin: 30, gender: "female" },
  { category: "Female Haircut", name: "Only Trimming Hair (No Headwash)", price: 150, durationMin: 20, gender: "female" },
  { category: "Female Haircut", name: "U Cut", price: 350, durationMin: 30, gender: "female" },
  { category: "Female Haircut", name: "V Cut", price: 350, durationMin: 30, gender: "female" },
  { category: "Female Haircut", name: "Stret Cut", price: 350, durationMin: 30, gender: "female" },
  { category: "Female Haircut", name: "Layer Cut", price: 450, durationMin: 45, gender: "female" },
  { category: "Female Haircut", name: "Butterfly Cut", price: 450, durationMin: 45, gender: "female" },
  { category: "Female Haircut", name: "Signature Cut", price: 450, durationMin: 45, gender: "female" },
  { category: "Female Haircut", name: "Threading (Eyebrow)", price: 50, durationMin: 15, gender: "female" },
  { category: "Female Haircut", name: "Upper Lip", price: 10, durationMin: 10, gender: "female" },
  { category: "Female Haircut", name: "Chin", price: 10, durationMin: 10, gender: "female" },

  // Category B: Male Haircut & Grooming (7 services)
  { category: "Male Haircut & Grooming", name: "Beard", price: 80, durationMin: 20, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Shaving", price: 70, durationMin: 20, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Only Beard Trim", price: 40, durationMin: 15, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Haircut + Hairwash + Styling", price: 200, durationMin: 40, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Hair Wash + Styling", price: 150, durationMin: 25, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Ironing", price: 150, durationMin: 20, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Mundan", price: 150, durationMin: 30, gender: "male" },

  // Category C: Wax (14 services)
  { category: "Wax", name: "Full Body Scrub", price: 2000, durationMin: 60, gender: "unisex" },
  { category: "Wax", name: "Full Body Polishing", price: 4000, durationMin: 75, gender: "unisex" },
  { category: "Wax", name: "Face Wax", price: 150, durationMin: 20, gender: "unisex" },
  { category: "Wax", name: "Appelis Wax", price: 100, durationMin: 15, gender: "unisex" },
  { category: "Wax", name: "Neck Wax", price: 100, durationMin: 15, gender: "unisex" },
  { category: "Wax", name: "Full Wax, Scrub, Polishing", price: 6000, durationMin: 120, gender: "unisex" },
  { category: "Wax", name: "Hand - Normal Hot Wax", price: 250, durationMin: 25, gender: "unisex" },
  { category: "Wax", name: "Hand - Leg - Normal Half Wax", price: 250, durationMin: 35, gender: "unisex" },
  { category: "Wax", name: "Hand - Leg - Normal Full Wax", price: 500, durationMin: 50, gender: "unisex" },
  { category: "Wax", name: "Rica - Hand - Full Hand", price: 500, durationMin: 30, gender: "unisex" },
  { category: "Wax", name: "Rica - Leg - Full Leg", price: 1500, durationMin: 45, gender: "unisex" },
  { category: "Wax", name: "Half Leg", price: 500, durationMin: 30, gender: "unisex" },
  { category: "Wax", name: "Full Body Normal", price: 1000, durationMin: 75, gender: "unisex" },
  { category: "Wax", name: "Full Body Rica", price: 2000, durationMin: 90, gender: "unisex" },

  // Category D: Hair Spa (14 services: 7 Male, 7 Female)
  { category: "Hair Spa", name: "Loreal (Amp)", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Milau Spa", price: 399, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Showscope", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Wella", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Godrej", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Shiabutter", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Dr. Lady", price: 399, durationMin: 45, gender: "male", variant: "Male" },

  { category: "Hair Spa", name: "Loreal (Amp)", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Milau Spa", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Showscope", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Wella", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Godrej", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Shiabutter", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Dr. Lady", price: 799, durationMin: 60, gender: "female", variant: "Female" },

  // Category E: Treatment (8 services: 4 Male, 4 Female)
  { category: "Treatment", name: "Botox", price: 999, durationMin: 60, gender: "male", variant: "Male" },
  { category: "Treatment", name: "Nanoplastic", price: 999, durationMin: 60, gender: "male", variant: "Male" },
  { category: "Treatment", name: "Keratin", price: 999, durationMin: 60, gender: "male", variant: "Male" },
  { category: "Treatment", name: "Smoothning", price: 999, durationMin: 60, gender: "male", variant: "Male" },

  { category: "Treatment", name: "Botox", price: 5500, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Treatment", name: "Nanoplastic", price: 5550, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Treatment", name: "Keratin", price: 5500, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Treatment", name: "Smoothning", price: 3999, durationMin: 90, gender: "female", variant: "Female" },

  // Category F: Other Hair & Skin Treatments (5 services)
  { category: "Other Hair & Skin Treatments", name: "Lice Treatment", price: 4999, durationMin: 90, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Curley Treatment - Only For Head", price: 1500, durationMin: 60, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Curley Treatment - Full Head", price: 2100, durationMin: 90, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Dandruff - High Frequency", price: 499, durationMin: 45, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Tan Removal - Hand Tanning", price: 300, durationMin: 30, gender: "unisex" },

  // Category G: Hair Colour (10 services: 5 Male, 5 Female)
  { category: "Hair Colour", name: "Loreal Glowbal", price: 399, durationMin: 60, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "Wonder Soft", price: 299, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "Nisha Herbal Jel", price: 200, durationMin: 30, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "High Light Per Stp", price: 40, durationMin: 15, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "High Light's 13/15 Stp", price: 500, durationMin: 60, gender: "male", variant: "Male" },

  { category: "Hair Colour", name: "Loreal Glowbal", price: 3000, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "Wonder Soft", price: 3000, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "High Light Per Stp", price: 200, durationMin: 20, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "High Light's 10/12 Stp", price: 2160, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "Root Touchup", price: 1000, durationMin: 45, gender: "female", variant: "Female" },

  // Category H: Hand & Feet (10 services: 5 Male, 5 Female)
  { category: "Hand & Feet", name: "Hand Scrub", price: 200, durationMin: 20, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Foot Scrub", price: 200, durationMin: 20, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Manicure", price: 500, durationMin: 40, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Half Pedicure", price: 500, durationMin: 40, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Full Pedicure", price: 1500, durationMin: 60, gender: "male", variant: "Male" },

  { category: "Hand & Feet", name: "Hand Scrub", price: 200, durationMin: 20, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Foot Scrub", price: 200, durationMin: 20, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Manicure", price: 500, durationMin: 40, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Half Pedicure", price: 500, durationMin: 40, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Full Pedicure", price: 1500, durationMin: 60, gender: "female", variant: "Female" },

  // Category I: Head Massage (2 services, gender-neutral)
  { category: "Head Massage", name: "Head Massage", price: 200, durationMin: 20, gender: "unisex" },
  { category: "Head Massage", name: "Spe. Head Massage", price: 300, durationMin: 30, gender: "unisex" },

  // Category J: Machine Treatment (5 services)
  { category: "Machine Treatment", name: "Skin Analysis", price: 150, durationMin: 15, gender: "unisex" },
  { category: "Machine Treatment", name: "Hair Analysis", price: 200, durationMin: 20, gender: "unisex" },
  { category: "Machine Treatment", name: "Skin Clean & Refreshing Nutrition", price: 499, durationMin: 45, gender: "unisex" },
  { category: "Machine Treatment", name: "Hydra Facial", price: 1499, durationMin: 60, gender: "unisex" },
  { category: "Machine Treatment", name: "Nose Clean", price: 350, durationMin: 20, gender: "unisex" },

  // Category K: Clean Up (5 services)
  { category: "Clean Up", name: "Nature Papaya", price: 250, durationMin: 30, gender: "unisex" },
  { category: "Clean Up", name: "Nature Fruite", price: 250, durationMin: 30, gender: "unisex" },
  { category: "Clean Up", name: "LG's Skin Whitening", price: 400, durationMin: 40, gender: "unisex" },
  { category: "Clean Up", name: "LG's Gold Cleanup", price: 400, durationMin: 40, gender: "unisex" },
  { category: "Clean Up", name: "Advance Gold Clean Up", price: 450, durationMin: 45, gender: "unisex" },

  // Category L: Facial (6 services)
  { category: "Facial", name: "Nature Papaya", price: 500, durationMin: 45, gender: "unisex" },
  { category: "Facial", name: "Nature Fruite", price: 500, durationMin: 45, gender: "unisex" },
  { category: "Facial", name: "LG's Skin Whitening", price: 799, durationMin: 60, gender: "unisex" },
  { category: "Facial", name: "LG's Gold", price: 799, durationMin: 60, gender: "unisex" },
  { category: "Facial", name: "Advance Gold Facial", price: 799, durationMin: 60, gender: "unisex" },
  { category: "Facial", name: "03+ Bridal Facial Kit", price: 2199, durationMin: 75, gender: "unisex" },

  // Category M: D-Tan (3 services)
  { category: "D-Tan", name: "Raga", price: 350, durationMin: 30, gender: "unisex" },
  { category: "D-Tan", name: "03+ D-TAN", price: 450, durationMin: 35, gender: "unisex" },
  { category: "D-Tan", name: "Raga Oxyglow", price: 300, durationMin: 30, gender: "unisex" },
];

function sanitize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function generateCatalogueServiceId(item, branchId = "koregaon") {
  const catPart = sanitize(item.category);
  const namePart = sanitize(item.name);
  const variantPart = sanitize(item.variant || item.gender || "all");
  const branchPart = sanitize(branchId);
  return `svc_${branchPart}_${catPart}_${namePart}_${variantPart}`;
}

async function runMigration() {
  console.log("=== Starting Complete Service Catalogue Replacement ===");

  // 1. Fetch current database state
  const servicesSnap = await db.collection("services").get();
  console.log(`Current Firestore services count: ${servicesSnap.size}`);

  // Set of target deterministic IDs for the new catalogue
  const newTargetIds = new Set(
    NEW_CATALOGUE.map((item) => generateCatalogueServiceId(item, "koregaon"))
  );

  console.log(`Target new catalogue entries: ${newTargetIds.size}`);

  // 2. Archive/deactivate all old services that are not in the new target IDs
  let archivedCount = 0;
  const batchSize = 400;
  let batch = db.batch();
  let opCount = 0;

  for (const doc of servicesSnap.docs) {
    if (!newTargetIds.has(doc.id)) {
      // Old service -> deactivate and archive
      batch.update(doc.ref, {
        active: false,
        isActive: false,
        archived: true,
        archivedAt: new Date().toISOString(),
      });
      archivedCount++;
      opCount++;

      if (opCount >= batchSize) {
        await batch.commit();
        batch = db.batch();
        opCount = 0;
      }
    }
  }

  if (opCount > 0) {
    await batch.commit();
    batch = db.batch();
    opCount = 0;
  }

  console.log(`Successfully archived ${archivedCount} old services.`);

  // 3. Upsert the new 102 services with exact names, prices, categories, and variants
  let createdCount = 0;
  const now = new Date().toISOString();

  for (const item of NEW_CATALOGUE) {
    const docId = generateCatalogueServiceId(item, "koregaon");
    const docRef = db.collection("services").doc(docId);

    batch.set(
      docRef,
      {
        branchId: "koregaon",
        category: item.category,
        name: item.name,
        price: item.price,
        durationMin: item.durationMin,
        durationMinutes: item.durationMin,
        gender: item.gender || "unisex",
        variant: item.variant || null,
        active: true,
        isActive: true,
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    createdCount++;
    opCount++;

    if (opCount >= batchSize) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }

  console.log(`Successfully upserted ${createdCount} new catalogue services.`);

  // 4. Verification Step
  console.log("\n=== Verifying Active Catalogue ===");
  const verifySnap = await db.collection("services").get();
  const allServices = verifySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const activeServices = allServices.filter((s) => s.active === true && !s.archived);
  console.log(`Active services count: ${activeServices.length} (Expected: 102)`);

  const activeCategories = Array.from(new Set(activeServices.map((s) => s.category)));
  console.log(`Active categories count: ${activeCategories.length} (Expected: 13)`);
  console.log("Categories found:", activeCategories);

  // Check each category service count
  const catCounts = {};
  activeServices.forEach((s) => {
    catCounts[s.category] = (catCounts[s.category] || 0) + 1;
  });

  console.log("\nActive Service counts per category:");
  for (const cat of CATALOGUE_CATEGORIES) {
    console.log(`  ${cat}: ${catCounts[cat] || 0} services`);
  }

  // Verify prices and names against NEW_CATALOGUE
  let mismatchCount = 0;
  for (const expected of NEW_CATALOGUE) {
    const found = activeServices.find(
      (s) =>
        s.category === expected.category &&
        s.name === expected.name &&
        (s.variant || null) === (expected.variant || null) &&
        (s.gender || null) === (expected.gender || null)
    );

    if (!found) {
      console.error(`MISMATCH: Missing active service: ${expected.category} - ${expected.name} (${expected.variant || expected.gender})`);
      mismatchCount++;
    } else if (found.price !== expected.price) {
      console.error(`PRICE MISMATCH: ${expected.name} expected ₹${expected.price}, found ₹${found.price}`);
      mismatchCount++;
    }
  }

  if (mismatchCount === 0) {
    console.log("\nSUCCESS: All 102 services and prices verified 100% accurately!");
  } else {
    throw new Error(`Migration verification failed with ${mismatchCount} mismatches.`);
  }

  // Verify historical appointments still have their service records
  const apptsSnap = await db.collection("appointments").get();
  let missingRefs = 0;
  apptsSnap.forEach((doc) => {
    const a = doc.data();
    const ids = a.serviceIds || (a.serviceId ? [a.serviceId] : []);
    ids.forEach((id) => {
      const match = allServices.find((s) => s.id === id);
      if (!match) {
        console.warn(`Warning: Historical appointment ${doc.id} references non-existent service ID ${id}`);
        missingRefs++;
      }
    });
  });

  console.log(`Historical appointments checked (${apptsSnap.size} total). Missing service references: ${missingRefs}`);
  console.log("=== Migration Completed Successfully ===");
}

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
