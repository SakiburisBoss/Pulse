import { SignIn } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <div className="grid place-items-center min-h-screen p-4">
      <SignIn />
    </div>
  );
};

export default Page;
