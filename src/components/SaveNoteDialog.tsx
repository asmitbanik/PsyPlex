import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added
import { useState, useEffect } from "react";

interface ClientLite {
  id: string;
  name: string;
}

interface SaveNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { title: string; tags: string[]; content: string; therapyType: string; clientId?: string }) => void;
  clients: ClientLite[]; // Added clients prop
  initialData?: { title?: string; tags?: string[]; content?: string; therapyType?: string; clientId?: string };
}

const SaveNoteDialog = ({ isOpen, onClose, onSave, clients, initialData }: SaveNoteDialogProps) => {
  const [title, setTitle] = useState("");
  const [tagsString, setTagsString] = useState("");
  const [content, setContent] = useState("");
  const [therapyType, setTherapyType] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setTagsString(initialData?.tags?.join(", ") || "");
      setContent(initialData?.content || "");
      setTherapyType(initialData?.therapyType || "");
      // Ensure a client is selected if not editing or if initialData doesn't have a clientId
      setSelectedClientId(initialData?.clientId || undefined);
    } else {
      // Reset all fields when the dialog is closed
      setTitle("");
      setTagsString("");
      setContent("");
      setTherapyType("");
      setSelectedClientId(undefined); // Reset selected client
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !selectedClientId || selectedClientId === "NO_CLIENT_SELECTED_VALUE") {
      console.warn("Title, Content, and Client are required.");
      // Optionally, provide more specific feedback to the user here
      return;
    }
    onSave({
      title,
      tags: tagsString.split(",").map(tag => tag.trim()).filter(Boolean),
      content,
      therapyType,
      clientId: selectedClientId === "NO_CLIENT_SELECTED_VALUE" ? undefined : selectedClientId
    });
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData?.title ? "Edit Clinical Note" : "Create Clinical Note"}</DialogTitle>
          <DialogDescription>
            Fill in the details for your clinical note. Fields marked with <span className="text-red-500">*</span> are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter note title"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">
              Client <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a client (Required)" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="NO_CLIENT_SELECTED_VALUE">No specific client</SelectItem> */}
                {(clients || []).map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="therapyType" className="text-right">
              Therapy Type
            </Label>
            <Input
              id="therapyType"
              value={therapyType}
              onChange={(e) => setTherapyType(e.target.value)}
              className="col-span-3"
              placeholder="e.g., CBT, General Note"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3 min-h-[120px]"
              placeholder="Enter note content, insights, observations..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input
              id="tags"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              className="col-span-3"
              placeholder="Enter tags (comma-separated)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!title.trim() || !content.trim() || !selectedClientId || selectedClientId === "NO_CLIENT_SELECTED_VALUE"}
          >
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveNoteDialog;
