import { Badge } from "@/components/ui/badge";

interface Props {
  name: string;
  color?: string | null;
}

export function TagBadge({ name, color }: Props) {
  return (
    <Badge
      variant="secondary"
      className="text-xs transition-colors duration-150"
      style={{
        borderColor: color ?? undefined,
        backgroundColor: color ? `${color}28` : undefined,
      }}
    >
      {name}
    </Badge>
  );
}
