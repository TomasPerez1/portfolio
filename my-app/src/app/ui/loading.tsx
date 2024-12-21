import { Skeleton } from "@nextui-org/react";

export default function Loading({ className }: { className: string }) {
  return (
    <Skeleton
      className={`min-w-[220px] min-h-[250px]  rounded-lg shadow-lg  bg-violet-950 ${className}`}
    >
      {/* <div></div> */}
    </Skeleton>
  );
}
