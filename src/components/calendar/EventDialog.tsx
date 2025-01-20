import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

  const handleDelete = async () => {
    if (sphere === 'google-calendar') {
      toast({
        title: "Cannot delete",
        description: "Google Calendar events cannot be deleted from this interface.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (onDelete) {
        onDelete(id);
      }

      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete the event.",
        variant: "destructive",
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>{name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Time: {startTime} - {endTime}</p>
            {isOwner && sphere !== 'google-calendar' && (
              <p className="text-sm text-muted-foreground mt-2">
                Tip: You can drag the event to change its time.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {isOwner && sphere !== 'google-calendar' && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}