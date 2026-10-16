import type { BranchId, Service } from "./types";

export const CATALOGUE_CATEGORIES = [
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
] as const;

export type CatalogueCategory = (typeof CATALOGUE_CATEGORIES)[number];

export interface CatalogueItemDef {
  category: CatalogueCategory;
  name: string;
  price: number;
  durationMin: number;
  gender?: "male" | "female" | "unisex";
  variant?: "Male" | "Female";
  description?: string;
}

export const NEW_CATALOGUE: CatalogueItemDef[] = [
  // ==========================================
  // Category A: Female Haircut (13 services)
  // ==========================================
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

  // ==========================================
  // Category B: Male Haircut & Grooming (7 services)
  // ==========================================
  { category: "Male Haircut & Grooming", name: "Beard", price: 80, durationMin: 20, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Shaving", price: 70, durationMin: 20, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Only Beard Trim", price: 40, durationMin: 15, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Haircut + Hairwash + Styling", price: 200, durationMin: 40, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Hair Wash + Styling", price: 150, durationMin: 25, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Ironing", price: 150, durationMin: 20, gender: "male" },
  { category: "Male Haircut & Grooming", name: "Mundan", price: 150, durationMin: 30, gender: "male" },

  // ==========================================
  // Category C: Wax (14 services)
  // ==========================================
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

  // ==========================================
  // Category D: Hair Spa (14 services: 7 Male, 7 Female)
  // ==========================================
  // Male
  { category: "Hair Spa", name: "Loreal (Amp)", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Milau Spa", price: 399, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Showscope", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Wella", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Godrej", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Shiabutter", price: 499, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Spa", name: "Dr. Lady", price: 399, durationMin: 45, gender: "male", variant: "Male" },
  // Female
  { category: "Hair Spa", name: "Loreal (Amp)", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Milau Spa", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Showscope", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Wella", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Godrej", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Shiabutter", price: 899, durationMin: 60, gender: "female", variant: "Female" },
  { category: "Hair Spa", name: "Dr. Lady", price: 799, durationMin: 60, gender: "female", variant: "Female" },

  // ==========================================
  // Category E: Treatment (8 services: 4 Male, 4 Female)
  // ==========================================
  // Male
  { category: "Treatment", name: "Botox", price: 999, durationMin: 60, gender: "male", variant: "Male" },
  { category: "Treatment", name: "Nanoplastic", price: 999, durationMin: 60, gender: "male", variant: "Male" },
  { category: "Treatment", name: "Keratin", price: 999, durationMin: 60, gender: "male", variant: "Male" },
  { category: "Treatment", name: "Smoothning", price: 999, durationMin: 60, gender: "male", variant: "Male" },
  // Female
  { category: "Treatment", name: "Botox", price: 5500, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Treatment", name: "Nanoplastic", price: 5550, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Treatment", name: "Keratin", price: 5500, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Treatment", name: "Smoothning", price: 3999, durationMin: 90, gender: "female", variant: "Female" },

  // ==========================================
  // Category F: Other Hair & Skin Treatments (5 services)
  // ==========================================
  { category: "Other Hair & Skin Treatments", name: "Lice Treatment", price: 4999, durationMin: 90, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Curley Treatment - Only For Head", price: 1500, durationMin: 60, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Curley Treatment - Full Head", price: 2100, durationMin: 90, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Dandruff - High Frequency", price: 499, durationMin: 45, gender: "unisex" },
  { category: "Other Hair & Skin Treatments", name: "Tan Removal - Hand Tanning", price: 300, durationMin: 30, gender: "unisex" },

  // ==========================================
  // Category G: Hair Colour (10 services: 5 Male, 5 Female)
  // ==========================================
  // Male
  { category: "Hair Colour", name: "Loreal Glowbal", price: 399, durationMin: 60, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "Wonder Soft", price: 299, durationMin: 45, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "Nisha Herbal Jel", price: 200, durationMin: 30, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "High Light Per Stp", price: 40, durationMin: 15, gender: "male", variant: "Male" },
  { category: "Hair Colour", name: "High Light's 13/15 Stp", price: 500, durationMin: 60, gender: "male", variant: "Male" },
  // Female
  { category: "Hair Colour", name: "Loreal Glowbal", price: 3000, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "Wonder Soft", price: 3000, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "High Light Per Stp", price: 200, durationMin: 20, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "High Light's 10/12 Stp", price: 2160, durationMin: 90, gender: "female", variant: "Female" },
  { category: "Hair Colour", name: "Root Touchup", price: 1000, durationMin: 45, gender: "female", variant: "Female" },

  // ==========================================
  // Category H: Hand & Feet (10 services: 5 Male, 5 Female)
  // ==========================================
  // Male
  { category: "Hand & Feet", name: "Hand Scrub", price: 200, durationMin: 20, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Foot Scrub", price: 200, durationMin: 20, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Manicure", price: 500, durationMin: 40, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Half Pedicure", price: 500, durationMin: 40, gender: "male", variant: "Male" },
  { category: "Hand & Feet", name: "Full Pedicure", price: 1500, durationMin: 60, gender: "male", variant: "Male" },
  // Female
  { category: "Hand & Feet", name: "Hand Scrub", price: 200, durationMin: 20, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Foot Scrub", price: 200, durationMin: 20, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Manicure", price: 500, durationMin: 40, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Half Pedicure", price: 500, durationMin: 40, gender: "female", variant: "Female" },
  { category: "Hand & Feet", name: "Full Pedicure", price: 1500, durationMin: 60, gender: "female", variant: "Female" },

  // ==========================================
  // Category I: Head Massage (2 services, gender-neutral)
  // ==========================================
  { category: "Head Massage", name: "Head Massage", price: 200, durationMin: 20, gender: "unisex" },
  { category: "Head Massage", name: "Spe. Head Massage", price: 300, durationMin: 30, gender: "unisex" },

  // ==========================================
  // Category J: Machine Treatment (5 services)
  // ==========================================
  { category: "Machine Treatment", name: "Skin Analysis", price: 150, durationMin: 15, gender: "unisex" },
  { category: "Machine Treatment", name: "Hair Analysis", price: 200, durationMin: 20, gender: "unisex" },
  { category: "Machine Treatment", name: "Skin Clean & Refreshing Nutrition", price: 499, durationMin: 45, gender: "unisex" },
  { category: "Machine Treatment", name: "Hydra Facial", price: 1499, durationMin: 60, gender: "unisex" },
  { category: "Machine Treatment", name: "Nose Clean", price: 350, durationMin: 20, gender: "unisex" },

  // ==========================================
  // Category K: Clean Up (5 services)
  // ==========================================
  { category: "Clean Up", name: "Nature Papaya", price: 250, durationMin: 30, gender: "unisex" },
  { category: "Clean Up", name: "Nature Fruite", price: 250, durationMin: 30, gender: "unisex" },
  { category: "Clean Up", name: "LG's Skin Whitening", price: 400, durationMin: 40, gender: "unisex" },
  { category: "Clean Up", name: "LG's Gold Cleanup", price: 400, durationMin: 40, gender: "unisex" },
  { category: "Clean Up", name: "Advance Gold Clean Up", price: 450, durationMin: 45, gender: "unisex" },

  // ==========================================
  // Category L: Facial (6 services)
  // ==========================================
  { category: "Facial", name: "Nature Papaya", price: 500, durationMin: 45, gender: "unisex" },
  { category: "Facial", name: "Nature Fruite", price: 500, durationMin: 45, gender: "unisex" },
  { category: "Facial", name: "LG's Skin Whitening", price: 799, durationMin: 60, gender: "unisex" },
  { category: "Facial", name: "LG's Gold", price: 799, durationMin: 60, gender: "unisex" },
  { category: "Facial", name: "Advance Gold Facial", price: 799, durationMin: 60, gender: "unisex" },
  { category: "Facial", name: "03+ Bridal Facial Kit", price: 2199, durationMin: 75, gender: "unisex" },

  // ==========================================
  // Category M: D-Tan (3 services)
  // ==========================================
  { category: "D-Tan", name: "Raga", price: 350, durationMin: 30, gender: "unisex" },
  { category: "D-Tan", name: "03+ D-TAN", price: 450, durationMin: 35, gender: "unisex" },
  { category: "D-Tan", name: "Raga Oxyglow", price: 300, durationMin: 30, gender: "unisex" },
];

/**
 * Generates an idempotent document ID for a catalogue service item.
 */
export function generateCatalogueServiceId(item: {
  category: string;
  name: string;
  gender?: string;
  variant?: string;
  branchId?: string;
}): string {
  const sanitize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const catPart = sanitize(item.category);
  const namePart = sanitize(item.name);
  const variantPart = sanitize(item.variant || item.gender || "all");
  const branchPart = sanitize(item.branchId || "koregaon");

  return `svc_${branchPart}_${catPart}_${namePart}_${variantPart}`;
}

export function getCategoryImageUrl(category: string, gender?: string): string | undefined {
  const cat = (category || "").toLowerCase();
  if (cat.includes("female haircut") || (cat.includes("haircut") && gender === "female")) {
    return "/images/haircut-grooming.webp";
  }
  if (cat.includes("male") || cat.includes("grooming")) {
    return "/images/mens-grooming.webp";
  }
  if (cat.includes("spa") || cat.includes("treatment")) {
    return "/images/hair-spa.webp";
  }
  if (cat.includes("colour") || cat.includes("color")) {
    return "/images/hair-colour.webp";
  }
  if (cat.includes("facial") || cat.includes("skin") || cat.includes("clean up") || cat.includes("d-tan")) {
    return "/images/facial-skincare.webp";
  }
  if (cat.includes("hand") || cat.includes("feet") || cat.includes("manicure") || cat.includes("pedicure")) {
    return "/images/manicure-nailcare.webp";
  }
  return undefined;
}

/**
 * Helper to convert catalogue definitions into complete Service objects.
 */
export function buildServiceEntities(branchId: BranchId = "koregaon"): Service[] {
  return NEW_CATALOGUE.map((item) => {
    const id = generateCatalogueServiceId({ ...item, branchId });
    return {
      id,
      branchId,
      category: item.category,
      name: item.name,
      price: item.price,
      durationMin: item.durationMin,
      durationMinutes: item.durationMin,
      active: true,
      isActive: true,
      gender: item.gender,
      variant: item.variant,
      imageUrl: getCategoryImageUrl(item.category, item.gender),
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}
