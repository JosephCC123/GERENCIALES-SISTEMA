import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export function PageHeader({ title, description, buttonLabel, onButtonClick }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {buttonLabel && (
        <Button onClick={onButtonClick} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
