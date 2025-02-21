
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface EventUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRecurring: boolean;
  hasInvitees: boolean;
  onUpdate: (updateType: 'single' | 'following' | 'series', notifyInvitees: boolean) => void;
}

export function EventUpdateDialog({
  open,
  onOpenChange,
  isRecurring,
  onUpdate,
}: EventUpdateDialogProps) {
  const [updateType, setUpdateType] = useState<'single' | 'following' | 'series'>('single');

  const handleUpdate = () => {
    onUpdate(updateType, false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-normal">Edit recurring event</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <RadioGroup
            value={updateType}
            onValueChange={(value: 'single' | 'following' | 'series') => setUpdateType(value)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="font-normal text-base">This event</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="following" id="following" />
              <Label htmlFor="following" className="font-normal text-base">This and following events</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="series" id="series" />
              <Label htmlFor="series" className="font-normal text-base">All events</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
