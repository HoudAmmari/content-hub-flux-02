
import React, { useState, useEffect } from "react";
import { CheckCircle2, Clock, Edit2, FileText, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { contentService } from "@/services/contentService";
import { Content } from "@/models/types";
import { format, formatDistanceToNow, isValid } from "date-fns";
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
        allContents.sort((a, b) => {
          // Verificar se updatedAt é válido
          const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
          const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
          
          // Verificar se as datas são válidas
          if (!isValid(dateA)) return 1;
          if (!isValid(dateB)) return -1;
          
          return dateB.getTime() - dateA.getTime();
        });
        
        // Transformar conteúdos em atividades
        const recentActivities = allContents
          .slice(0, 5)
          .map(content => mapContentToActivity(content))
          .filter(activity => activity !== null) as ActivityType[];
        
        setActivities(recentActivities);
      } catch (error) {
        console.error("Erro ao buscar atividades recentes:", error);
      }
    }
    
    fetchRecentActivities();
  }, []);
  
  // Mapear conteúdo para formato de atividade
  const mapContentToActivity = (content: Content): ActivityType | null => {
    try {
      // Validar datas
      const createdAt = content.createdAt ? new Date(content.createdAt) : null;
      const updatedAt = content.updatedAt ? new Date(content.updatedAt) : null;
      
      if (!createdAt || !isValid(createdAt) || !updatedAt || !isValid(updatedAt)) {
        console.log(`Ignorando conteúdo com datas inválidas: ${content.id}`);
        return null;
      }
      
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
      
      // Formatação segura de datas
      let timeText;
      try {
        timeText = formatDistanceToNow(updatedAt, { 
          addSuffix: true,
          locale: ptBR 
        });
      } catch (e) {
        console.log(`Erro ao formatar data para o conteúdo ${content.id}:`, e);
        timeText = "data desconhecida";
      }
      
      return {
        id: content.id,
        description: activityType.description,
        title: content.title,
        time: timeText,
        icon: activityType.icon,
        color: activityType.color,
        timestamp: updatedAt
      };
    } catch (error) {
      console.error(`Erro ao mapear atividade para conteúdo ${content.id}:`, error);
      return null;
    }
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
