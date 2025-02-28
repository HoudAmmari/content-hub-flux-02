
import { CheckCircle2, Clock, Edit2, FileText, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    description: "Criou um novo conteúdo",
    title: "Guia de React Hooks",
    time: "1h atrás",
    icon: PlusCircle,
    color: "bg-green-500",
  },
  {
    id: 2,
    description: "Atualizou o conteúdo",
    title: "Dicas de CSS avançado",
    time: "2h atrás",
    icon: Edit2,
    color: "bg-blue-500",
  },
  {
    id: 3,
    description: "Moveu para finalizado",
    title: "NextJS para iniciantes",
    time: "3h atrás",
    icon: CheckCircle2,
    color: "bg-purple-500",
  },
  {
    id: 4,
    description: "Editou o conteúdo",
    title: "Introdução ao TypeScript",
    time: "5h atrás",
    icon: Edit2,
    color: "bg-blue-500",
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center gap-3 rounded-md border p-3 transition-all hover:bg-accent/50"
        >
          <Avatar className={cn("h-9 w-9", activity.color)}>
            <AvatarFallback className="text-white">
              <activity.icon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.description}</p>
            <p className="text-sm text-muted-foreground">{activity.title}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{activity.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
