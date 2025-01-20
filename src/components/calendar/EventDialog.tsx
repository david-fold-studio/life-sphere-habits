import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { handleEventDelete } from "./eventDialogUtils";
import { EventDetails } from "./EventDetails";

interface EventDialogProps {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sphere: string;
  isOwner: boolean;
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
  open,
  onOpenChange,
  onDelete 
}: EventDialogProps) {
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 rounded-3xl overflow-hidden">
        <Card className="border-0 shadow-none rounded-3xl">
          <CardHeader>
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          <EventDetails
            startTime={startTime}
            endTime={endTime}
            isOwner={isOwner}
            sphere={sphere}
          />
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {isOwner && sphere !== 'google-calendar' && (
              <Button 
                variant="destructive" 
                onClick={() => handleEventDelete(id, sphere, onDelete, toast, onOpenChange)}
              >
                Delete
              </Button>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}