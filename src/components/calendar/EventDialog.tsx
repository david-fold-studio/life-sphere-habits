import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  frequency?: string;
  invitees?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: {
    startTime: string;
    endTime: string;
    date: Date;
    isRecurring: boolean;
    frequency?: string;
    invitees: string[];
  }) => void;
}

export function EventDialog({ 
  id, 
  name, 
  startTime, 
  endTime, 
  sphere,
  isOwner,
  isRecurring,
  frequency,
  invitees = [],
  open,
  onOpenChange,
  onDelete,
  onUpdate
}: EventDialogProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (data: {
    startTime: string;
    endTime: string;
    date: Date;
    isRecurring: boolean;
    frequency?: string;
    invitees: string[];
  }) => {
    onUpdate?.(id, data);
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 rounded-3xl overflow-hidden">
        <Card className="border-0 shadow-none rounded-3xl">
          <CardHeader>
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          
          {isEditing ? (
            <EventEditForm
              id={id}
              name={name}
              startTime={startTime}
              endTime={endTime}
              date={new Date()} // TODO: Pass actual date
              isRecurring={isRecurring}
              frequency={frequency}
              invitees={invitees}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <EventDetails
                startTime={startTime}
                endTime={endTime}
                isOwner={isOwner}
                sphere={sphere}
                isRecurring={isRecurring}
                frequency={frequency}
                invitees={invitees}
              />
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
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