
import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Edit2, FileText, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { contentService } from "@/services/contentService";
import { Content } from "@/models/types";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type ActivityType = {
  id: string;
  description: string;
  title: string;
  time: string;
  icon: any;
  color: string;
  timestamp: Date;
};

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  
  useEffect(() => {
    async function fetchRecentActivities() {
      try {
        // Buscar todos os conteúdos
        const allContents = await contentService.getAllContents();
        
        // Ordenar por data de atualização (mais recentes primeiro)
        allContents.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        
        // Transformar conteúdos em atividades
        const recentActivities = allContents.slice(0, 5).map(content => {
          return mapContentToActivity(content);
        });
        
        setActivities(recentActivities);
      } catch (error) {
        console.error("Erro ao buscar atividades recentes:", error);
      }
    }
    
    fetchRecentActivities();
  }, []);
  
  // Mapear conteúdo para formato de atividade
  const mapContentToActivity = (content: Content): ActivityType => {
    // Determinar tipo de atividade com base no status e datas
    const createdAt = new Date(content.createdAt);
    const updatedAt = new Date(content.updatedAt);
    
    let activityType: {
      description: string;
      icon: any;
      color: string;
    };
    
    // Se foi criado e atualizado na mesma hora, é uma criação
    if (content.createdAt === content.updatedAt) {
      activityType = {
        description: "Criou um novo conteúdo",
        icon: PlusCircle,
        color: "bg-green-500"
      };
    } 
    // Se está completo, foi finalizado
    else if (content.status === "completed") {
      activityType = {
        description: "Moveu para finalizado",
        icon: CheckCircle2,
        color: "bg-purple-500"
      };
    } 
    // Caso contrário, foi atualizado
    else {
      activityType = {
        description: "Atualizou o conteúdo",
        icon: Edit2,
        color: "bg-blue-500"
      };
    }
    
    return {
      id: content.id,
      description: activityType.description,
      title: content.title,
      time: formatDistanceToNow(updatedAt, { 
        addSuffix: true,
        locale: ptBR 
      }),
      icon: activityType.icon,
      color: activityType.color,
      timestamp: updatedAt
    };
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma atividade recente encontrada
        </div>
      ) : (
        activities.map((activity) => (
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
        ))
      )}
    </div>
  );
}
