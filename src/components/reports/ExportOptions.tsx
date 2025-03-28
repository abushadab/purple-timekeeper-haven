
import * as React from "react";
import { Download, FileSpreadsheet, FileText, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ExportOptionsProps {
  onExport: (format: string) => void;
  isLoading?: boolean;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ onExport, isLoading = false }) => {
  const handleExport = async (format: string) => {
    try {
      toast.info(`Preparing ${format.toUpperCase()} export...`);
      await onExport(format);
      toast.success(`${format.toUpperCase()} export complete!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed", {
        description: "There was an error exporting your report.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="purple-gradient text-white border-none gap-1" 
          disabled={isLoading}
        >
          <Download size={16} />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleExport("excel")} 
          className="cursor-pointer"
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport("csv")} 
          className="cursor-pointer"
          disabled={isLoading}
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>CSV (.csv)</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport("pdf")} 
          className="cursor-pointer"
          disabled={isLoading}
        >
          <FileIcon className="mr-2 h-4 w-4" />
          <span>PDF (.pdf)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportOptions;
