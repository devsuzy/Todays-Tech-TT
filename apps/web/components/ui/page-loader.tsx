"use client";
import { BeatLoader } from "react-spinners";

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <BeatLoader color="#008080" />
    </div>
  );
}
