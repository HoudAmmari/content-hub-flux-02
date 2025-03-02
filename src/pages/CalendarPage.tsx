
import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parse, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewContentDialog } from "@/components/content/NewContentDialog";
import { ContentDialog } from "@/components/content/ContentDialog";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
}

// Sample events data
const events: CalendarEvent[] = [
  {
    id: "1",
    title: "Post sobre React Hooks",
    date: "2025-03-05",
    type: "blog",
    status: "writing"
  },
  {
    id: "2",
    title: "Vídeo explicando useContext",
    date: "2025-03-08",
    type: "youtube",
    status: "idea"
  },
  {
    id: "3",
    title: "Como melhorar sua produtividade",
    date: "2025-03-12",
    type: "blog",
    status: "review"
  },
  {
    id: "4",
    title: "Tendências em frontend",
    date: "2025-03-15",
    type: "linkedin",
    status: "writing"
  },
  {
    id: "5",
    title: "Guia rápido: TypeScript",
    date: "2025-03-18",
    type: "videos",
    status: "done"
  },
  {
    id: "6",
    title: "Dicas para trabalho remoto",
    date: "2025-03-22",
    type: "blog",
    status: "idea"
  },
  {
    id: "7",
    title: "Novidades do Node.js",
    date: "2025-03-25",
    type: "youtube",
    status: "review"
  }
];

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedView, setSelectedView] = useState("month");
  const [openNewContent, setOpenNewContent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };
  
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(event => event.date === dateStr);
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "blog":
        return "bg-blue-500 border-blue-600";
      case "youtube":
        return "bg-red-500 border-red-600";
      case "linkedin":
        return "bg-blue-700 border-blue-800";
      case "videos":
        return "bg-pink-500 border-pink-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };
  
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const dateFormat = "EEE";
    const days = [];
    
    // Header with weekday names
    const daysOfWeek = [];
    let day = startDate;
    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(
        <div key={`header-${i}`} className="text-center text-sm font-medium p-1 border-b">
          {format(day, dateFormat, { locale: ptBR })}
        </div>
      );
      day = addDays(day, 1);
    }
    
    day = startDate;
    let formattedDate = "";
    
    while (day <= endDate) {
      const week = [];
      
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const dateEvents = getEventsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        
        week.push(
          <div 
            key={day.toString()} 
            className={cn(
              "min-h-24 p-1 border flex flex-col relative",
              isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground",
              isToday && "border-primary/40",
              isSelected && "bg-accent"
            )}
            onClick={() => handleDateClick(day)}
          >
            <div className={cn(
              "text-sm font-medium h-6 w-6 flex items-center justify-center",
              isToday && "rounded-full bg-primary text-primary-foreground"
            )}>
              {formattedDate}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 pt-1">
              {dateEvents.map((event) => (
                <div 
                  key={event.id}
                  className={cn(
                    "text-xs p-1 rounded border-l-2 text-white truncate cursor-pointer",
                    getEventTypeColor(event.type)
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      days.push(
        <div key={`week-${day}`} className="grid grid-cols-7">
          {week}
        </div>
      );
    }
    
    return (
      <div className="calendar-container">
        <div className="grid grid-cols-7">
          {daysOfWeek}
        </div>
        <div>{days}</div>
      </div>
    );
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "idea":
        return "Ideia";
      case "writing":
        return "Escrevendo";
      case "review":
        return "Revisão";
      case "done":
        return "Pronto";
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "idea":
        return "bg-yellow-500/20 text-yellow-700";
      case "writing":
        return "bg-blue-500/20 text-blue-700";
      case "review":
        return "bg-purple-500/20 text-purple-700";
      case "done":
        return "bg-green-500/20 text-green-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };
  
  const getTypeText = (type: string) => {
    switch (type) {
      case "blog":
        return "Blog";
      case "youtube":
        return "YouTube";
      case "linkedin":
        return "LinkedIn";
      case "videos":
        return "Vídeos Curtos";
      default:
        return type;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select
            value={selectedView}
            onValueChange={setSelectedView}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Visualização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="day">Dia</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => setOpenNewContent(true)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Novo</span>
          </Button>
        </div>
      </div>
      
      <Card className="p-2">
        {renderMonthView()}
      </Card>
      
      <NewContentDialog 
        open={openNewContent} 
        onOpenChange={setOpenNewContent} 
        initialDate={selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined}
      />
      
      {selectedEvent && (
        <Dialog 
          open={!!selectedEvent} 
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={cn(getStatusColor(selectedEvent.status))}>
                  {getStatusText(selectedEvent.status)}
                </Badge>
                <Badge variant="outline">
                  {getTypeText(selectedEvent.type)}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium">Data de Publicação</h4>
                <p className="text-muted-foreground">
                  {format(parse(selectedEvent.date, "yyyy-MM-dd", new Date()), "P", { locale: ptBR })}
                </p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedEvent(null)}
                >
                  Fechar
                </Button>
                <Button>
                  Editar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
