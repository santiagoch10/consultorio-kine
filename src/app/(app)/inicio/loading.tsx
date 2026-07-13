import { SkeletonHeader, SkeletonCards, SkeletonList } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div className="mb-6">
        <SkeletonCards count={4} />
      </div>
      <SkeletonList rows={4} />
    </div>
  );
}
