import { cn } from "@/lib/utils";

const GoldShimmerSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-md bg-muted animate-gold-shimmer bg-[length:200%_100%]",
      className
    )}
    style={{
      backgroundImage:
        "linear-gradient(90deg, hsl(35, 20%, 92%) 25%, hsl(42, 58%, 80%) 50%, hsl(35, 20%, 92%) 75%)",
    }}
    {...props}
  />
);

export default GoldShimmerSkeleton;
