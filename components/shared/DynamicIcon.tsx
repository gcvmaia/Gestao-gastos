import { MoreHorizontal, type LucideIcon, type LucideProps } from "lucide-react";
import * as icons from "lucide-react";

export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const mapa = icons as unknown as Record<string, LucideIcon>;
  const Icon = mapa[name] ?? MoreHorizontal;
  return <Icon {...props} />;
}
