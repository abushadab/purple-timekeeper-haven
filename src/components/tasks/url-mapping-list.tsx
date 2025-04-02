
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { UrlMapping } from "@/services/tasks";

interface UrlMappingListProps {
  urlMappings: UrlMapping[];
  onUrlMappingChange: (index: number, field: keyof UrlMapping, value: string) => void;
  onAddUrlMapping: () => void;
  onRemoveUrlMapping: (index: number) => void;
}

export function UrlMappingList({ 
  urlMappings, 
  onUrlMappingChange, 
  onAddUrlMapping, 
  onRemoveUrlMapping 
}: UrlMappingListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>URL Mappings</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onAddUrlMapping}
          className="h-8 px-2"
        >
          <Plus className="w-4 h-4 mr-1" /> Add URL
        </Button>
      </div>
      <div className="space-y-3">
        {urlMappings.map((mapping, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="grid grid-cols-2 gap-2 flex-1">
              <Input
                placeholder="Title (e.g., Login Page)"
                value={mapping.title}
                onChange={(e) => onUrlMappingChange(index, 'title', e.target.value)}
              />
              <Input
                placeholder="URL (e.g., /login)"
                value={mapping.url}
                onChange={(e) => onUrlMappingChange(index, 'url', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveUrlMapping(index)}
              disabled={urlMappings.length <= 1}
              className="px-2"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
