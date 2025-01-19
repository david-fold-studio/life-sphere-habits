import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EventDialogProps {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  sphere: string;
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Time: {startTime} - {endTime}</p>
          {sphere !== 'google-calendar' && (
            <p className="text-sm text-muted-foreground mt-2">
              Tip: You can drag the event to change its time.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {sphere !== 'google-calendar' && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}