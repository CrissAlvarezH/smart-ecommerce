"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface SortDropdownProps {
  defaultValue?: string;
}

export function SortDropdown({ defaultValue = "newest" }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <select 
      className="border rounded-lg px-4 py-2 text-sm"
      value={defaultValue}
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="newest">Newest First</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name">Name: A to Z</option>
    </select>
  );
}