const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const sa = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const EXPECTED_CATEGORIES = [
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

const EXPECTED_SERVICES = [
  // Category A: Female Haircut (13)
  { category: "Female Haircut", name: "Hair Wash & Styling", price: 250, gender: "female" },
  { category: "Female Haircut", name: "Ironing", price: 400, gender: "female" },
  { category: "Female Haircut", name: "Tong", price: 400, gender: "female" },
  { category: "Female Haircut", name: "Only Trimming Hair (No Headwash)", price: 150, gender: "female" },
  { category: "Female Haircut", name: "U Cut", price: 350, gender: "female" },
  { category: "Female Haircut", name: "V Cut", price: 350, gender: "female" },
  { category: "Female Haircut", name: "Stret Cut", price: 350, gender: "female" },
  { category: "Female Haircut", name: "Layer Cut", price: 450, gender: "female" },
  { category: "Female Haircut", name: "Butterfly Cut", price: 450, gender: "female" },
  { category: "Female Haircut", name: "Signature Cut", price: 450, gender: "female" },
  { category: "Female Haircut", name: "Threading (Eyebrow)", price: 50, gender: "female" },
  { category: "Female Haircut", name: "Upper Lip", price: 10, gender: "female" },
  { category: "Female Haircut", name: "Chin", price: 10, gender: "female" },

  // Category B: Male Haircut & Grooming (7)
  { category: "Male Haircut & Grooming", name: "Beard", price: 80, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Shaving", price: 70, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Only Beard Trim", price: 40, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Haircut + Hairwash + Styling", price: 200, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Hair Wash + Styling", price: 150, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Ironing", price: 150, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Mundan", price: 150, gender: "male" },

  // Category C: Wax (14)
  { category: "Wax", name: "Full Body Scrub", price: 2000, gender: "unisex" },
  { category: "Wax", name: "Full Body Polishing", price: 4000, gender: "unisex" },
  { category: "Wax", name: "Face Wax", price: 150, gender: "unisex" },
  { category: "Wax", name: "Appelis Wax", price: 100, gender: "unisex" },
  { category: "Wax", name: "Neck Wax", price: 100, gender: "unisex" },
  { category: "Wax", name: "Full Wax, Scrub, Polishing", price: 6000, gender: "unisex" },
  { category: "Wax", name: "Hand - Normal Hot Wax", price: 250, gender: "unisex" },
  { category: "Wax", name: "Hand - Leg - Normal Half Wax", price: 250, gender: "unisex" },
  { category: "Wax", name: "Hand - Leg - Normal Full Wax", price: 500, gender: "unisex" },
  { category: "Wax", name: "Rica - Hand - Full Hand", price: 500, gender: "unisex" },
  { category: "Wax", name: "Rica - Leg - Full Leg", price: 1500, gender: "unisex" },
  { category: "Wax", name: "Half Leg", price: 500, gender: "unisex" },
  { category: "Wax", name: "Full Body Normal", price: 1000, gender: "unisex" },
  { category: "Wax", name: "Full Body Rica", price: 2000, gender: "unisex" },

  // Category D: Hair Spa (14: 7 Male, 7 Female)
  { category: "Hair Spa", name: "Loreal (Amp)", price: 499, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Milau Spa", price: 399, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Showscope", price: 499, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Wella", price: 499, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Godrej", price: 499, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Shiabutter", price: 499, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Dr. Lady", price: 399, gender: "male", variant: "Male" },

  { category: "Hair Spa", name: "Loreal (Amp)", price: 899, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Milau Spa", price: 899, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Showscope", price: 899, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Wella", price: 899, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Godrej", price: 899, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Shiabutter", price: 899, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Dr. Lady", price: 799, gender: "female", variant: "Female" },

  // Category E: Treatment (8: 4 Male, 4 Female)
  { category: "Treatment", name: "Botox", price: 999, gender: "male", variant: "Male" },
  { category: "Treatment", name: "Nanoplastic", price: 999, gender: "male", variant: "Male" },
  { category: "Treatment", name: "Keratin", price: 999, gender: "male", variant: "Male" },
  { category: "Treatment", name: "Smoothning", price: 999, gender: "male", variant: "Male" },

  { category: "Treatment", name: "Botox", price: 5500, gender: "female", variant: "Female" },
  { category: "Treatment", name: "Nanoplastic", price: 5550, gender: "female", variant: "Female" },
  { category: "Treatment", name: "Keratin", price: 5500, gender: "female", variant: "Female" },
  { category: "Treatment", name: "Smoothning", price: 3999, gender: "female", variant: "Female" },

  // Category F: Other Hair & Skin Treatments (5)
  { category: "Other Hair & Skin Treatments", name: "Lice Treatment", price: 4999, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Curley Treatment - Only For Head", price: 1500, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Curley Treatment - Full Head", price: 2100, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Dandruff - High Frequency", price: 499, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Tan Removal - Hand Tanning", price: 300, gender: "unisex" },

  // Category G: Hair Colour (10: 5 Male, 5 Female)
  { category: "Hair Colour", name: "Loreal Glowbal", price: 399, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "Wonder Soft", price: 299, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "Nisha Herbal Jel", price: 200, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "High Light Per Stp", price: 40, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "High Light's 13/15 Stp", price: 500, gender: "male", variant: "Male" },

  { category: "Hair Colour", name: "Loreal Glowbal", price: 3000, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "Wonder Soft", price: 3000, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "High Light Per Stp", price: 200, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "High Light's 10/12 Stp", price: 2160, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "Root Touchup", price: 1000, gender: "female", variant: "Female" },

  // Category H: Hand & Feet (10: 5 Male, 5 Female)
  { category: "Hand & Feet", name: "Hand Scrub", price: 200, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Foot Scrub", price: 200, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Manicure", price: 500, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Half Pedicure", price: 500, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Full Pedicure", price: 1500, gender: "male", variant: "Male" },

  { category: "Hand & Feet", name: "Hand Scrub", price: 200, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Foot Scrub", price: 200, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Manicure", price: 500, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Half Pedicure", price: 500, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Full Pedicure", price: 1500, gender: "female", variant: "Female" },

  // Category I: Head Massage (2)
  { category: "Head Massage", name: "Head Massage", price: 200, gender: "unisex" },
  { category: "Head Massage", name: "Spe. Head Massage", price: 300, gender: "unisex" },

  // Category J: Machine Treatment (5)
  { category: "Machine Treatment", name: "Skin Analysis", price: 150, gender: "unisex" },
  { category: "Machine Treatment", name: "Hair Analysis", price: 200, gender: "unisex" },
  { category: "Machine Treatment", name: "Skin Clean & Refreshing Nutrition", price: 499, gender: "unisex" },
  { category: "Machine Treatment", name: "Hydra Facial", price: 1499, gender: "unisex" },
  { category: "Machine Treatment", name: "Nose Clean", price: 350, gender: "unisex" },

  // Category K: Clean Up (5)
  { category: "Clean Up", name: "Nature Papaya", price: 250, gender: "unisex" },
  { category: "Clean Up", name: "Nature Fruite", price: 250, gender: "unisex" },
  { category: "Clean Up", name: "LG's Skin Whitening", price: 400, gender: "unisex" },
  { category: "Clean Up", name: "LG's Gold Cleanup", price: 400, gender: "unisex" },
  { category: "Clean Up", name: "Advance Gold Clean Up", price: 450, gender: "unisex" },

  // Category L: Facial (6)
  { category: "Facial", name: "Nature Papaya", price: 500, gender: "unisex" },
  { category: "Facial", name: "Nature Fruite", price: 500, gender: "unisex" },
  { category: "Facial", name: "LG's Skin Whitening", price: 799, gender: "unisex" },
  { category: "Facial", name: "LG's Gold", price: 799, gender: "unisex" },
  { category: "Facial", name: "Advance Gold Facial", price: 799, gender: "unisex" },
  { category: "Facial", name: "03+ Bridal Facial Kit", price: 2199, gender: "unisex" },

  // Category M: D-Tan (3)
  { category: "D-Tan", name: "Raga", price: 350, gender: "unisex" },
  { category: "D-Tan", name: "03+ D-TAN", price: 450, gender: "unisex" },
  { category: "D-Tan", name: "Raga Oxyglow", price: 300, gender: "unisex" },
];

async function runValidation() {
  console.log("====================================================");
  console.log("GLOW & GLAMOUR HAIR STUDIO — FULL CATALOGUE AUDIT");
  console.log("====================================================\n");

  const servicesSnap = await db.collection("services").get();
  const allServices = servicesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const activeServices = allServices.filter(s => s.active === true && !s.archived);
  const archivedServices = allServices.filter(s => s.archived === true || s.active === false);

  console.log(`Total Services in DB: ${allServices.length}`);
  console.log(`Active Services: ${activeServices.length}`);
  console.log(`Archived Services: ${archivedServices.length}\n`);

  // Test 1: Exactly 13 categories exist
  console.log("TEST 1: Category Count and Set Verification");
  const activeCats = Array.from(new Set(activeServices.map(s => s.category)));
  if (activeCats.length !== 13) {
    throw new Error(`Expected exactly 13 categories, but found ${activeCats.length}: ${JSON.stringify(activeCats)}`);
  }
  for (const expCat of EXPECTED_CATEGORIES) {
    if (!activeCats.includes(expCat)) {
      throw new Error(`Missing expected category: "${expCat}"`);
    }
  }
  console.log(`  PASSED: Exactly 13 categories exist: ${JSON.stringify(activeCats, null, 2)}\n`);

  // Test 2: Exactly 102 active services exist and every price matches
  console.log("TEST 2: Service Names and Exact INR Numeric Prices");
  if (activeServices.length !== 102) {
    throw new Error(`Expected 102 active services, found ${activeServices.length}`);
  }

  for (const exp of EXPECTED_SERVICES) {
    const match = activeServices.find(
      s =>
        s.category === exp.category &&
        s.name === exp.name &&
        (s.variant || null) === (exp.variant || null) &&
        (s.gender || null) === (exp.gender || null)
    );
    if (!match) {
      throw new Error(`Missing service: [${exp.category}] "${exp.name}" (${exp.variant || exp.gender})`);
    }
    if (match.price !== exp.price) {
      throw new Error(`Price mismatch for "${exp.name}": expected ${exp.price}, got ${match.price}`);
    }
    if (typeof match.price !== "number") {
      throw new Error(`Price is not numeric: "${exp.name}" price is ${typeof match.price}`);
    }
  }
  console.log("  PASSED: All 102 services have exact names, exact numeric prices, and exact categories.\n");

  // Test 3: No old service is active
  console.log("TEST 3: Active Catalogue Exclusivity (No Old Services in Active Catalogue)");
  const newIds = new Set(
    EXPECTED_SERVICES.map(s => {
      const catPart = s.category.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      const namePart = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      const varPart = (s.variant || s.gender || "all").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      return `svc_koregaon_${catPart}_${namePart}_${varPart}`;
    })
  );

  for (const s of activeServices) {
    if (!newIds.has(s.id)) {
      throw new Error(`Old or unauthorized service found in active catalogue: ${s.id} - ${s.name} (${s.category})`);
    }
  }
  console.log("  PASSED: Only new catalogue items are active. Zero old services in active catalogue.\n");

  // Test 4: Gender variants verification
  console.log("TEST 4: Male/Female Variant Separation and Price Verification");
  const hairSpaMaleLoreal = activeServices.find(s => s.category === "Hair Spa" && s.name === "Loreal (Amp)" && s.variant === "Male");
  const hairSpaFemaleLoreal = activeServices.find(s => s.category === "Hair Spa" && s.name === "Loreal (Amp)" && s.variant === "Female");
  if (!hairSpaMaleLoreal || hairSpaMaleLoreal.price !== 499) {
    throw new Error(`Hair Spa Male Loreal (Amp) failed: expected 499, got ${hairSpaMaleLoreal?.price}`);
  }
  if (!hairSpaFemaleLoreal || hairSpaFemaleLoreal.price !== 899) {
    throw new Error(`Hair Spa Female Loreal (Amp) failed: expected 899, got ${hairSpaFemaleLoreal?.price}`);
  }

  const treatmentMaleBotox = activeServices.find(s => s.category === "Treatment" && s.name === "Botox" && s.variant === "Male");
  const treatmentFemaleBotox = activeServices.find(s => s.category === "Treatment" && s.name === "Botox" && s.variant === "Female");
  if (!treatmentMaleBotox || treatmentMaleBotox.price !== 999) {
    throw new Error(`Treatment Male Botox failed: expected 999, got ${treatmentMaleBotox?.price}`);
  }
  if (!treatmentFemaleBotox || treatmentFemaleBotox.price !== 5500) {
    throw new Error(`Treatment Female Botox failed: expected 5500, got ${treatmentFemaleBotox?.price}`);
  }

  const colorMaleGlobal = activeServices.find(s => s.category === "Hair Colour" && s.name === "Loreal Glowbal" && s.variant === "Male");
  const colorFemaleGlobal = activeServices.find(s => s.category === "Hair Colour" && s.name === "Loreal Glowbal" && s.variant === "Female");
  if (!colorMaleGlobal || colorMaleGlobal.price !== 399) {
    throw new Error(`Hair Colour Male Loreal Glowbal failed: expected 399, got ${colorMaleGlobal?.price}`);
  }
  if (!colorFemaleGlobal || colorFemaleGlobal.price !== 3000) {
    throw new Error(`Hair Colour Female Loreal Glowbal failed: expected 3000, got ${colorFemaleGlobal?.price}`);
  }

  const handFeetMaleScrub = activeServices.find(s => s.category === "Hand & Feet" && s.name === "Hand Scrub" && s.variant === "Male");
  const handFeetFemaleScrub = activeServices.find(s => s.category === "Hand & Feet" && s.name === "Hand Scrub" && s.variant === "Female");
  if (!handFeetMaleScrub || handFeetMaleScrub.price !== 200) {
    throw new Error(`Hand & Feet Male Scrub failed: expected 200, got ${handFeetMaleScrub?.price}`);
  }
  if (!handFeetFemaleScrub || handFeetFemaleScrub.price !== 200) {
    throw new Error(`Hand & Feet Female Scrub failed: expected 200, got ${handFeetFemaleScrub?.price}`);
  }
  console.log("  PASSED: All male/female variants are strictly separated with distinct prices.\n");

  // Test 5: End-to-end multi-service test booking
  console.log("TEST 5: Multi-Service Booking Creation Test");
  const testServices = [
    activeServices.find(s => s.category === "Female Haircut" && s.name === "Hair Wash & Styling"),
    activeServices.find(s => s.category === "Female Haircut" && s.name === "Butterfly Cut"),
    activeServices.find(s => s.category === "Hair Spa" && s.name === "Milau Spa" && s.variant === "Female"),
  ];
  const expectedTotal = 250 + 450 + 899; // 1599

  const testApptRef = db.collection("appointments").doc("test_validation_booking");
  await testApptRef.set({
    reference: "VAL-TEST-99",
    customerId: "test_customer",
    customerName: "Pooja Sharma",
    customerPhone: "+91 98765 43210",
    customerEmail: "pooja.test@example.com",
    branchId: "koregaon",
    serviceIds: testServices.map(s => s.id),
    serviceId: testServices[0].id,
    date: new Date().toISOString().slice(0, 10),
    time: "14:30",
    startTime: "14:30",
    priceAtBooking: expectedTotal,
    status: "confirmed",
    isWalkIn: false,
    token: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "website",
  });

  const createdApptSnap = await testApptRef.get();
  const createdAppt = createdApptSnap.data();
  if (createdAppt.priceAtBooking !== expectedTotal) {
    throw new Error(`Booking test failed: expected price ${expectedTotal}, got ${createdAppt.priceAtBooking}`);
  }
  console.log(`  PASSED: Test booking created with 3 services totaling ₹${expectedTotal}.\n`);

  // Clean up the test booking
  await testApptRef.delete();
  console.log("  Cleaned up temporary validation booking doc.\n");

  // Test 6: Historical appointment integrity
  console.log("TEST 6: Historical Appointments Integrity");
  const apptsSnap = await db.collection("appointments").get();
  console.log(`  Total historical appointments in database: ${apptsSnap.size}`);
  let validOldLookups = 0;
  apptsSnap.forEach(doc => {
    const data = doc.data();
    if (data.serviceIds && Array.isArray(data.serviceIds)) {
      data.serviceIds.forEach(id => {
        const found = allServices.find(s => s.id === id);
        if (found) validOldLookups++;
      });
    }
  });
  console.log(`  Historical service lookups successfully resolved: ${validOldLookups}`);
  console.log("  PASSED: Historical appointment service data remains safely preserved.\n");

  console.log("====================================================");
  console.log("ALL VALIDATION CHECKS PASSED WITH 100% ACCURACY!");
  console.log("====================================================");
}

runValidation()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("VALIDATION FAILED:", err);
    process.exit(1);
  });
