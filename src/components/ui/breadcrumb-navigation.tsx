
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
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, index) => {
          // Use a React key for the Fragment instead of data-lov-id
          return (
            <li key={index}>
              {index !== 0 && <BreadcrumbSeparator />}
              {index === items.length - 1 ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={item.href || "#"}>{item.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
            </li>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
