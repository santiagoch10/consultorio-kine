import { SkeletonHeader, SkeletonCalendar } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonCalendar />
    </div>
  );
}
