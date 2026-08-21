import { cn } from "@/lib/cn";

export interface FeatureCardProps {
  image: string;
  title: string;
  body: string;
  className?: string;
}

/** Services 3-up item — image on top, title + body below. */
export function FeatureCard({ image, title, body, className }: FeatureCardProps) {
  return (
    <article className={cn("flex flex-col gap-xl", className)}>
      <img src={image} alt="" loading="lazy" className="h-media w-full rounded-bl-xl rounded-tr-xl object-cover" />
      <div className="flex flex-col gap-xs pr-2xl">
        <h3 className="text-title-strong text-text-on-light">{title}</h3>
        <p className="text-body-sm text-text-muted-light">{body}</p>
      </div>
    </article>
  );
}

export default FeatureCard;
