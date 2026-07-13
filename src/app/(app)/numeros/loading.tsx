import { SkeletonHeader, SkeletonCards } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonCards count={6} />
    </div>
  );
}
