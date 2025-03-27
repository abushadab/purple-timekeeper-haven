import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNavigation({ items }: BreadcrumbNavigationProps) {
  return (
<BreadcrumbList>
  {items.map((item, index) => [
    index !== 0 && <BreadcrumbSeparator key={`separator-${index}`} />,
    <BreadcrumbItem key={index}>
      {index === items.length - 1 ? (
        <BreadcrumbPage>{item.label}</BreadcrumbPage>
      ) : (
        <BreadcrumbLink asChild>
          <Link to={item.href || "#"}>{item.label}</Link>
        </BreadcrumbLink>
      )}
    </BreadcrumbItem>,
  ])}
</BreadcrumbList>
  );
}