import React from "react";
import Image from "next/image";

export function Breathing1minIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <Image
      src="/images/breathing-1min.png"
      alt=""
      aria-hidden="true"
      width={580}
      height={580}
      className={className}
      style={{ backgroundColor: "transparent", mixBlendMode: "normal" }}
      priority={false}
    />
  );
}
