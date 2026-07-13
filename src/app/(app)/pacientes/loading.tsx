import { SkeletonHeader, SkeletonForm, SkeletonList } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div className="mb-4">
        <SkeletonForm />
      </div>
      <SkeletonList rows={6} />
    </div>
  );
}
