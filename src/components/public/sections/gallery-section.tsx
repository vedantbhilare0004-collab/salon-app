"use client";

import { SalonImage } from "@/components/ui/salon-image";

export function GallerySection() {
  const galleryItems = [
    {
      id: 1,
      image: "/images/About-Us.png",
      title: "Koregaon Studio Interior",
      category: "Our Studio",
      alt: "Glow & Glamour salon interior with black styling chairs and illuminated mirrors in Koregaon",
    },
    {
      id: 2,
      image: "/images/haircut-grooming.webp",
      title: "Precision Haircut & Styling",
      category: "Hair Styling",
      alt: "Stylist precision cutting hair with scissors and comb at salon station",
    },
    {
      id: 3,
      image: "/images/hair-spa.webp",
      title: "Botanical Hair Spa Ritual",
      category: "Hair Care",
      alt: "Deep conditioning hair mask and scalp therapy at salon wash basin",
    },
    {
      id: 4,
      image: "/images/facial-skincare.webp",
      title: "Glowing Facial & Skin Care",
      category: "Skin Care",
      alt: "Relaxing facial skincare treatment with gentle brush mask application",
    },
    {
      id: 5,
      image: "/images/hair-colour.webp",
      title: "Hair Colour & Highlights",
      category: "Color & Highlights",
      alt: "Professional hair color and balayage application with tint brush",
    },
    {
      id: 6,
      image: "/images/mens-grooming.webp",
      title: "Men's Precision Grooming",
      category: "Men's Grooming",
      alt: "Barber neck taper and beard grooming in styling chair",
    },
  ];

  return (
    <section id="gallery" className="py-20 bg-white border-b border-[#E8E2D8]">
      <div className="container px-4 md:px-8 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center mb-14 space-y-3">
          <div className="text-xs font-semibold tracking-[0.25em] uppercase text-[#8E6D38]">
            OUR STUDIO
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#222220]">
            Inside Our Hair Studio
          </h2>
          <p className="text-[#666660] text-sm max-w-xl font-light">
            A glimpse into our comfortable salon spaces and everyday client styling at Glow &amp; Glamour in Koregaon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xs overflow-hidden group shadow-xs border border-[#E8E2D8] bg-[#FAF8F5] p-2 flex flex-col"
            >
              <div className="relative overflow-hidden rounded-xs bg-[#ECEAE4]">
                <SalonImage
                  src={item.image}
                  alt={item.alt || item.title}
                  aspectRatio="4/3"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
              </div>

              <div className="pt-3 pb-1 px-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8E6D38] block mb-0.5">
                  {item.category}
                </span>
                <h3 className="font-heading text-base font-bold text-[#222220] leading-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
