import { supabase } from "@/integrations/supabase/client";
import { Toast } from "@/components/ui/use-toast";

export const handleEventDelete = async (
  id: string,
  sphere: string,
  onDelete?: (id: string) => void,
  toast: (props: Toast) => void,
  onOpenChange: (open: boolean) => void
) => {
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