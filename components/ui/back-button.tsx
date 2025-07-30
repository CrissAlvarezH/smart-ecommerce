"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function BackButton({ 
  children, 
  variant = "outline", 
  size = "sm",
  className 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleBack}
      className={className}
    >
      <ArrowLeft className={cn("h-4 w-4", children ? "mr-2" : "")} />
      {children ? children : undefined}
    </Button>
  );
}