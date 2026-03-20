import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { PhotoMetadata } from "../backend";
import PhotoCard from "../components/PhotoCard";
import { useGetAllPhotos } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

const SAMPLE_PHOTOS = [
  {
    id: "sample-1",
    title: "Sacred Diyas",
    description:
      "Hundreds of oil lamps illuminate the temple courtyard on the auspicious evening of Deepavali.",
    imageUrl: "/assets/generated/festival-diyas.dim_800x600.jpg",
  },
  {
    id: "sample-2",
    title: "Grand Gopuram",
    description:
      "The magnificent temple tower adorned with fresh marigold garlands and festive lights.",
    imageUrl: "/assets/generated/festival-gopuram.dim_800x600.jpg",
  },
  {
    id: "sample-3",
    title: "Evening Aarti",
    description:
      "Devotees gathered for the sacred evening prayer ceremony, offering flames to the divine.",
    imageUrl: "/assets/generated/festival-aarti.dim_800x600.jpg",
  },
  {
    id: "sample-4",
    title: "Flower Rangoli",
    description:
      "Intricate rangoli patterns crafted from marigold petals welcome devotees at the temple entrance.",
    imageUrl: "/assets/generated/festival-rangoli.dim_800x600.jpg",
  },
  {
    id: "sample-5",
    title: "Festival Procession",
    description:
      "The ceremonial elephant leads the grand procession through the streets during the annual festival.",
    imageUrl: "/assets/generated/festival-procession.dim_800x600.jpg",
  },
];

export default function GalleryPage() {
  const { data: photos, isLoading } = useGetAllPhotos();

  const hasRealPhotos = photos && photos.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.08 0.02 55 / 0.95), transparent)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪔</span>
          <span className="font-serif text-lg font-semibold text-gold">
            Sri Mahadeva Temple
          </span>
        </div>
        <nav>
          <Link
            to="/admin"
            className="text-sm text-muted-foreground hover:text-gold transition-colors px-4 py-2 border border-border rounded-md hover:border-gold/30"
            data-ocid="nav.admin.link"
          >
            Admin Panel
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/festival-hero.dim_1600x900.jpg')",
          }}
        />
        <div className="absolute inset-0 gradient-hero" />

        <motion.div
          className="relative z-10 px-6 max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="ornament text-sm tracking-widest mb-4">
            ✦ OM NAMAH SHIVAYA ✦
          </p>
          <h1
            className="font-serif text-5xl md:text-7xl font-bold mb-4 text-foreground"
            style={{ textShadow: "0 2px 20px oklch(0 0 0 / 0.6)" }}
          >
            Sri Mahadeva
            <span className="block text-gold">Temple Festival</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mt-4 leading-relaxed">
            A sacred celebration of devotion, colour, and divine blessings
          </p>
          <motion.div
            className="mt-8 w-24 h-px mx-auto"
            style={{
              background:
                "linear-gradient(to right, transparent, oklch(0.78 0.15 75), transparent)",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          />
          <motion.p
            className="mt-6 text-gold text-sm tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            Scroll to explore the gallery
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.8,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-gold/40 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-gold rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="ornament text-xs tracking-widest mb-3">
            ✦ DIVINE MOMENTS ✦
          </p>
          <h2 className="font-serif text-4xl font-bold text-foreground">
            Festival <span className="text-gold">Gallery</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Cherished memories from our sacred celebrations, captured for
            eternity
          </p>
        </motion.div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="gallery.loading_state"
          >
            {SKELETON_KEYS.map((key) => (
              <Skeleton key={key} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hasRealPhotos
              ? photos.map((photo: PhotoMetadata, i: number) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5 }}
                    data-ocid={`gallery.item.${i + 1}`}
                  >
                    <PhotoCard
                      title={photo.title}
                      description={photo.description}
                      imageUrl={photo.blob.getDirectURL()}
                    />
                  </motion.div>
                ))
              : SAMPLE_PHOTOS.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    data-ocid={`gallery.item.${i + 1}`}
                  >
                    <PhotoCard
                      title={photo.title}
                      description={photo.description}
                      imageUrl={photo.imageUrl}
                    />
                  </motion.div>
                ))}
          </div>
        )}

        {!isLoading && !hasRealPhotos && (
          <motion.div
            className="text-center mt-8 p-6 rounded-lg border border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="gallery.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              Showing sample photos. Log in as admin to upload real festival
              photos.
            </p>
          </motion.div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="ornament text-xs mb-3">✦ OM SHANTI ✦</p>
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Sri Mahadeva Temple. Built with love
          using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-bright transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
