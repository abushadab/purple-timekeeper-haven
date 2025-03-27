
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Plus, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { addTaskScreenshot, deleteTaskScreenshot, Screenshot } from "@/services/taskService";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ScreenshotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  taskId: string;
  screenshots: Screenshot[];
  onScreenshotsUpdated: () => void;
}

const ScreenshotsDialog: React.FC<ScreenshotsDialogProps> = ({
  open,
  onOpenChange,
  taskName,
  taskId,
  screenshots,
  onScreenshotsUpdated,
}) => {
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState<string>("");
  const [newThumbnailUrl, setNewThumbnailUrl] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [screenshotToDelete, setScreenshotToDelete] = useState<Screenshot | null>(null);

  const handleAddScreenshot = async () => {
    if (!newScreenshotUrl.trim()) {
      toast({
        title: "Error",
        description: "Screenshot URL is required",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await addTaskScreenshot(taskId, newScreenshotUrl, newThumbnailUrl || newScreenshotUrl);
      toast({
        title: "Screenshot added",
        description: "The screenshot has been added successfully",
      });
      setNewScreenshotUrl("");
      setNewThumbnailUrl("");
      setIsAdding(false);
      onScreenshotsUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add screenshot",
        variant: "destructive",
      });
      console.error("Error adding screenshot:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenDeleteConfirm = (screenshot: Screenshot) => {
    setScreenshotToDelete(screenshot);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteScreenshot = async () => {
    if (!screenshotToDelete) return;

    try {
      await deleteTaskScreenshot(screenshotToDelete.id);
      toast({
        title: "Screenshot deleted",
        description: "The screenshot has been deleted successfully",
      });
      
      // If the deleted screenshot was the selected one, reset selection
      if (selectedImage?.id === screenshotToDelete.id) {
        setSelectedImage(null);
      }
      
      onScreenshotsUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete screenshot",
        variant: "destructive",
      });
      console.error("Error deleting screenshot:", error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex justify-between items-center">
              <span>Screenshots: {taskName}</span>
              <Button 
                onClick={() => setIsAdding(true)} 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 mr-[15px]"
              >
                <Plus size={16} />
                <span>Add Screenshot</span>
              </Button>
            </DialogTitle>
          </DialogHeader>

          {isAdding && (
            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-medium mb-2">Add New Screenshot</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="screenshotUrl">Screenshot URL</Label>
                  <Input 
                    id="screenshotUrl" 
                    value={newScreenshotUrl}
                    onChange={(e) => setNewScreenshotUrl(e.target.value)}
                    placeholder="https://example.com/screenshot.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
                  <Input 
                    id="thumbnailUrl" 
                    value={newThumbnailUrl}
                    onChange={(e) => setNewThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsAdding(false);
                      setNewScreenshotUrl("");
                      setNewThumbnailUrl("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handleAddScreenshot}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    ) : (
                      <Upload size={16} />
                    )}
                    <span>Add Screenshot</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">
                    Captured: {formatTimestamp(selectedImage.timestamp)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                    onClick={() => handleOpenDeleteConfirm(selectedImage)}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {screenshots.length > 0 ? (
                screenshots.map((screenshot) => (
                  <div
                    key={screenshot.id}
                    className="relative group"
                  >
                    <div 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImage(screenshot)}
                    >
                      <img
                        src={screenshot.thumbnail_url || screenshot.url}
                        alt="Screenshot thumbnail"
                        className="w-full h-40 object-cover rounded-md"
                      />
                      {screenshot.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {formatTimestamp(screenshot.timestamp)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/60 text-white hover:bg-black/80 transition-opacity p-1.5 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteConfirm(screenshot);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">
                    No screenshots available for this task
                  </p>
                  <Button 
                    className="mt-4"
                    variant="outline" 
                    onClick={() => setIsAdding(true)}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Your First Screenshot
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Screenshot"
        description="Are you sure you want to delete this screenshot? This action cannot be undone."
        onConfirm={handleDeleteScreenshot}
        confirmText="Delete"
      />
    </>
  );
};

export default ScreenshotsDialog;
