
import { Clock, CalendarIcon, Edit2, FileText, Instagram, Linkedin, Youtube } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const tasks = [
  {
    id: 1,
    title: "Elaborar conteúdo sobre React",
    dueDate: "Hoje, 18:00",
    status: "Escrevendo",
    type: "Blog",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Gravar vídeo curto sobre NextJS",
    dueDate: "Amanhã, 12:00",
    status: "Ideia",
    type: "Reels",
    icon: Instagram,
    color: "bg-pink-500",
  },
  {
    id: 3,
    title: "Revisar post sobre carreira",
    dueDate: "Qui, 10:00",
    status: "Revisão",
    type: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700",
  },
  {
    id: 4,
    title: "Finalizar tutorial de TypeScript",
    dueDate: "Sex, 15:00",
    status: "Escrevendo",
    type: "YouTube",
    icon: Youtube,
    color: "bg-red-500",
  },
];

export function UpcomingTasks() {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between rounded-md border p-3 transition-all hover:bg-accent/50"
        >
          <div className="flex items-center gap-3">
            <Avatar className={cn("h-9 w-9", task.color)}>
              <AvatarFallback className="text-white">
                <task.icon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{task.title}</p>
              <div className="flex items-center text-xs text-muted-foreground gap-1">
                <Clock className="h-3 w-3" /> {task.dueDate}
                <span className="mx-1">•</span>
                <span>{task.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5">
              {task.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
