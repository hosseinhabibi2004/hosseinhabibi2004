import type { PublicImage } from "@/lib/content/types";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  image: PublicImage | null;
  className?: string;
}

export function CoverImage({ image, className }: CoverImageProps) {
  if (!image) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export: images are not optimised
    <img
      src={image.url}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
      className={cn("h-auto w-full rounded-lg object-cover", className)}
    />
  );
}
