
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Plus, Upload, Trash2, Image, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { addTaskScreenshot, deleteTaskScreenshot, Screenshot } from "@/services/tasks";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { supabase } from "@/integrations/supabase/client";

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
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [screenshotToDelete, setScreenshotToDelete] = useState<Screenshot | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only JPG, PNG, GIF and WebP images are supported",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddScreenshot = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload the image to Supabase Storage
      const timestamp = new Date().toISOString();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${timestamp.replace(/:/g, '-')}.${fileExt}`;
      const filePath = `${taskId}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-screenshots')
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // 2. Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('task-screenshots')
        .getPublicUrl(filePath);
      
      // 3. Create a thumbnail if needed (for simplicity, we're using the same image as both screenshot and thumbnail)
      const thumbnailUrl = publicUrl;
      
      // 4. Save the screenshot info to the database
      await addTaskScreenshot(taskId, publicUrl, thumbnailUrl);
      
      toast({
        title: "Screenshot added",
        description: "The screenshot has been uploaded successfully",
      });
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsAdding(false);
      onScreenshotsUpdated();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload screenshot",
        variant: "destructive",
      });
      console.error("Error uploading screenshot:", error);
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
      // 1. Delete from database
      await deleteTaskScreenshot(screenshotToDelete.id);
      
      // 2. Extract the storage path from the URL
      // Example URL: https://oeawkdfkvrezcitqczuy.supabase.co/storage/v1/object/public/task-screenshots/taskId/filename.jpg
      const urlParts = screenshotToDelete.url.split('task-screenshots/');
      if (urlParts.length > 1) {
        const storagePath = urlParts[1];
        
        // 3. Delete from storage
        await supabase.storage
          .from('task-screenshots')
          .remove([storagePath]);
      }
      
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

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsAdding(false);
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
              <h3 className="font-medium mb-2">Upload New Screenshot</h3>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Screenshot preview" 
                      className="w-full h-auto max-h-[300px] object-contain"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelUpload}
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
                      <span>Upload Screenshot</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={handleClickUpload}
                >
                  <FileImage className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to select or drop an image</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF or WebP (max 5MB)</p>
                </div>
              )}
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
