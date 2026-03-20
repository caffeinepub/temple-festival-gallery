import { motion } from "motion/react";
import { useState } from "react";

interface PhotoCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

export default function PhotoCard({
  title,
  description,
  imageUrl,
}: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group relative rounded-xl overflow-hidden border border-border cursor-pointer"
      style={{ background: "oklch(0.16 0.02 55)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.06 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Gold border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1px oklch(0.78 0.15 75 / 0)" }}
        animate={{
          boxShadow: isHovered
            ? "inset 0 0 0 1px oklch(0.78 0.15 75 / 0.6)"
            : "inset 0 0 0 1px oklch(0.78 0.15 75 / 0)",
        }}
        transition={{ duration: 0.25 }}
      />

      <div className="p-4">
        <div className="flex items-start gap-2">
          <div
            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "oklch(0.78 0.15 75)" }}
          />
          <div>
            <h3 className="font-serif font-semibold text-foreground leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
