import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface EventUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRecurring: boolean;
  hasInvitees: boolean;
  onUpdate: (updateType: 'single' | 'series', notifyInvitees: boolean) => void;
}

export function EventUpdateDialog({
  open,
  onOpenChange,
  isRecurring,
  hasInvitees,
  onUpdate,
}: EventUpdateDialogProps) {
  const [updateType, setUpdateType] = useState<'single' | 'series'>('single');
  const [notifyInvitees, setNotifyInvitees] = useState(true);

  const handleUpdate = () => {
    onUpdate(updateType, notifyInvitees);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Event</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isRecurring && (
            <div className="space-y-2">
              <h4 className="font-medium">This is a recurring event</h4>
              <div className="space-x-4">
                <Button
                  variant={updateType === 'single' ? 'default' : 'outline'}
                  onClick={() => setUpdateType('single')}
                >
                  This occurrence
                </Button>
                <Button
                  variant={updateType === 'series' ? 'default' : 'outline'}
                  onClick={() => setUpdateType('series')}
                >
                  All occurrences
                </Button>
              </div>
            </div>
          )}
          
          {hasInvitees && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify"
                checked={notifyInvitees}
                onCheckedChange={(checked) => setNotifyInvitees(checked as boolean)}
              />
              <label
                htmlFor="notify"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Notify invitees
              </label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}