import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { handleEventDelete } from "./eventDialogUtils";
import { EventDetails } from "./EventDetails";
import { EventEditForm } from "./EventEditForm";
import { useState } from "react";

interface EventDialogProps {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sphere: string;
  isOwner: boolean;
  isRecurring?: boolean;
  hasInvitees?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

export function EventDialog({ 
  id, 
  name, 
  startTime, 
  endTime, 
  sphere,
  isOwner,
  isRecurring = false,
  hasInvitees = false,
  open,
  onOpenChange,
  onDelete
}: EventDialogProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleClose = () => {
    setIsEditing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 rounded-3xl overflow-hidden">
        <Card className="border-0 shadow-none rounded-3xl">
          <CardHeader>
            <DialogTitle className="text-lg font-semibold">{name}</DialogTitle>
          </CardHeader>
          
          {isEditing ? (
            <EventEditForm
              id={id}
              name={name}
              startTime={startTime}
              endTime={endTime}
              date={new Date()}
              isRecurring={isRecurring}
              invitees={[]}
              onSave={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <CardContent>
                <EventDetails
                  startTime={startTime}
                  endTime={endTime}
                  isOwner={isOwner}
                  sphere={sphere}
                  isRecurring={isRecurring}
                  hasInvitees={hasInvitees}
                />
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                {isOwner && sphere !== 'google-calendar' && (
                  <>
                    <Button onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleEventDelete(id, sphere, onOpenChange, toast, onDelete)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </CardFooter>
            </>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
}