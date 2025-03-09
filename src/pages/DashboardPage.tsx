
import { useEffect, useState } from "react";
import { ContentMetrics } from "@/components/dashboard/ContentMetrics";
import { Overview } from "@/components/dashboard/Overview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { FileText, Video, Radio, Clock } from "lucide-react";
import { contentService } from "@/services/contentService";
import { projectService } from "@/services/projectService";
import { channelService } from "@/services/channelService";
import { useQuery } from "@tanstack/react-query";
import { Content } from "@/models/types";
import { differenceInDays, subDays, subMonths, format } from "date-fns";

const DashboardPage = () => {
  // Buscar todos os conteúdos com refetch para garantir dados atualizados
  const { data: contents = [], refetch: refetchContents } = useQuery({
    queryKey: ['dashboard-contents'],
    queryFn: async () => {
      console.log("Buscando conteúdos para o dashboard...");
      const allContents = await contentService.getAllContents();
      console.log(`Total de conteúdos encontrados: ${allContents.length}`);
      return allContents;
    }
  });

  // Buscar dados sobre projetos
  const { data: projects = [] } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: async () => {
      return await projectService.getAllProjects();
    }
  });

  // Estatísticas de conteúdo
  const [contentStats, setContentStats] = useState({
    total: 0,
    videos: 0,
    blog: 0,
    linkedin: 0,
    newThisWeek: 0,
    newVideosThisWeek: 0,
    newBlogThisWeek: 0
  });

  // Tempo médio de produção
  const [productionTime, setProductionTime] = useState({
    average: "0",
    difference: "0"
  });

  // Calcular estatísticas com base nos conteúdos
  useEffect(() => {
    console.log(`Calculando estatísticas com ${contents.length} conteúdos...`);
    
    if (contents.length === 0) return;

    const now = new Date();
    const oneWeekAgo = subDays(now, 7);
    const oneMonthAgo = subMonths(now, 1);
    const twoMonthsAgo = subMonths(now, 2);
    
    // Conteúdos por tipo
    const videos = contents.filter(c => c.type === "video" || c.channelId === "youtube" || c.channelId === "instagram");
    const blogPosts = contents.filter(c => c.type === "blog" || c.channelId === "blog");
    const linkedinPosts = contents.filter(c => c.channelId === "linkedin");
    
    console.log(`Vídeos: ${videos.length}, Blog: ${blogPosts.length}, LinkedIn: ${linkedinPosts.length}`);
    
    // Conteúdos novos nesta semana
    const newContents = contents.filter(c => new Date(c.createdAt || '') >= oneWeekAgo);
    const newVideos = videos.filter(c => new Date(c.createdAt || '') >= oneWeekAgo);
    const newBlogPosts = blogPosts.filter(c => new Date(c.createdAt || '') >= oneWeekAgo);

    // Calcular tempo médio de produção (em dias) para conteúdos finalizados no último mês
    const completedLastMonth = contents.filter(c => 
      c.status === 'completed' && 
      new Date(c.updatedAt || '') >= oneMonthAgo
    );
    
    const completedTwoMonthsAgo = contents.filter(c => 
      c.status === 'completed' && 
      new Date(c.updatedAt || '') >= twoMonthsAgo &&
      new Date(c.updatedAt || '') < oneMonthAgo
    );

    // Calcular tempo médio (diferença entre criação e conclusão)
    let totalDays = 0;
    let totalDaysPrevMonth = 0;
    
    completedLastMonth.forEach(content => {
      if (content.createdAt && content.updatedAt) {
        const createdAt = new Date(content.createdAt);
        const updatedAt = new Date(content.updatedAt);
        totalDays += differenceInDays(updatedAt, createdAt);
      }
    });
    
    completedTwoMonthsAgo.forEach(content => {
      if (content.createdAt && content.updatedAt) {
        const createdAt = new Date(content.createdAt);
        const updatedAt = new Date(content.updatedAt);
        totalDaysPrevMonth += differenceInDays(updatedAt, createdAt);
      }
    });
    
    const averageDays = completedLastMonth.length > 0 
      ? (totalDays / completedLastMonth.length).toFixed(1) 
      : "0";
      
    const averagePrevMonth = completedTwoMonthsAgo.length > 0 
      ? (totalDaysPrevMonth / completedTwoMonthsAgo.length).toFixed(1) 
      : averageDays;
      
    const difference = (parseFloat(averageDays) - parseFloat(averagePrevMonth)).toFixed(1);

    setContentStats({
      total: contents.length,
      videos: videos.length,
      blog: blogPosts.length,
      linkedin: linkedinPosts.length,
      newThisWeek: newContents.length,
      newVideosThisWeek: newVideos.length,
      newBlogThisWeek: newBlogPosts.length
    });
    
    setProductionTime({
      average: averageDays,
      difference: difference
    });
    
    console.log(`Estatísticas calculadas: ${contents.length} conteúdos totais`);
    
  }, [contents]);

  // Agrupar conteúdos por mês para o gráfico Overview
  const getMonthlyContentData = () => {
    if (contents.length === 0) return [];
    
    // Criar um mapa para agrupar conteúdos por mês
    const monthsMap = new Map();
    
    // Inicializar todos os meses com zero
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    months.forEach(month => {
      monthsMap.set(month, 0);
    });
    
    // Contar conteúdos por mês
    contents.forEach(content => {
      if (content.createdAt) {
        const date = new Date(content.createdAt);
        const month = months[date.getMonth()];
        monthsMap.set(month, monthsMap.get(month) + 1);
      }
    });
    
    // Converter mapa para array do formato esperado pelo gráfico
    return months.map(month => ({
      name: month,
      total: monthsMap.get(month)
    }));
  };

  // Agrupar conteúdos por tipo para o gráfico de pizza
  const getContentTypeData = () => {
    if (contents.length === 0) return [];
    
    const typeData = [
      { 
        name: "Vídeos Curtos", 
        value: contents.filter(c => c.type === "video" || c.channelId === "youtube" || c.channelId === "instagram").length,
        color: "#3B82F6" 
      },
      { 
        name: "Blog", 
        value: contents.filter(c => c.type === "blog" || c.channelId === "blog").length,
        color: "#10B981" 
      },
      { 
        name: "LinkedIn", 
        value: contents.filter(c => c.channelId === "linkedin").length,
        color: "#6366F1" 
      },
      { 
        name: "YouTube", 
        value: contents.filter(c => c.channelId === "youtube").length,
        color: "#F43F5E" 
      }
    ];
    
    // Remover tipos sem conteúdo
    return typeData.filter(type => type.value > 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conteúdos Totais</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {contentStats.newThisWeek > 0 ? `+${contentStats.newThisWeek}` : '0'} desde a semana passada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vídeos Curtos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.videos}</div>
            <p className="text-xs text-muted-foreground">
              {contentStats.newVideosThisWeek > 0 ? `+${contentStats.newVideosThisWeek}` : '0'} desde a semana passada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts de Blog</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.blog}</div>
            <p className="text-xs text-muted-foreground">
              {contentStats.newBlogThisWeek > 0 ? `+${contentStats.newBlogThisWeek}` : '0'} desde a semana passada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Produção</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionTime.average} dias</div>
            <p className="text-xs text-muted-foreground">
              {parseFloat(productionTime.difference) < 0 
                ? parseFloat(productionTime.difference) * -1 + " dias mais rápido" 
                : parseFloat(productionTime.difference) > 0 
                  ? "+" + productionTime.difference + " dias mais lento"
                  : "Mesmo tempo que o mês passado"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>
              Conteúdo produzido nos últimos 12 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Overview data={getMonthlyContentData()} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Métricas de Conteúdo</CardTitle>
            <CardDescription>
              Distribuição por tipo de conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentMetrics data={getContentTypeData()} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
            <CardDescription>
              Conteúdos a serem entregues em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingTasks />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
