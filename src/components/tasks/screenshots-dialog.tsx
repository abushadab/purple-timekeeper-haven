
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface Screenshot {
  id: string;
  url: string;
  thumbnailUrl?: string;
  timestamp?: string;
}

interface ScreenshotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  screenshots: Screenshot[];
}

const ScreenshotsDialog: React.FC<ScreenshotsDialogProps> = ({
  open,
  onOpenChange,
  taskName,
  screenshots,
}) => {
  const [selectedImage, setSelectedImage] = React.useState<Screenshot | null>(
    null
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Screenshots: {taskName}
          </DialogTitle>
        </DialogHeader>

        {selectedImage ? (
          <div className="relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X size={20} />
            </button>
            <img
              src={selectedImage.url}
              alt="Full screenshot"
              className="w-full h-auto rounded-md"
            />
            {selectedImage.timestamp && (
              <p className="text-sm text-muted-foreground mt-2">
                Captured: {selectedImage.timestamp}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {screenshots.length > 0 ? (
              screenshots.map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(screenshot)}
                >
                  <img
                    src={screenshot.thumbnailUrl || screenshot.url}
                    alt="Screenshot thumbnail"
                    className="w-full h-40 object-cover rounded-md"
                  />
                  {screenshot.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {screenshot.timestamp}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">
                  No screenshots available for this task
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScreenshotsDialog;
