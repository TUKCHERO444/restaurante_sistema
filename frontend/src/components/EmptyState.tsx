import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ message, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-semibold">{message}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
