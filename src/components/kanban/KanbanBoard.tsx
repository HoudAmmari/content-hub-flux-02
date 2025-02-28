
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { Button } from "@/components/ui/button";
import { FilterX, ListFilter, Plus } from "lucide-react";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { KanbanFilters } from "@/components/kanban/KanbanFilters";
import { NewContentDialog } from "@/components/content/NewContentDialog";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample data
const channels = [
  { id: "videos", name: "Vídeos Curtos" },
  { id: "blog", name: "Blog" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "youtube", name: "YouTube" },
];

const columns = [
  { id: "idea", name: "Ideia" },
  { id: "writing", name: "Escrevendo" },
  { id: "review", name: "Revisão" },
  { id: "done", name: "Pronto" },
];

const mockCards = [
  {
    id: "1",
    title: "Como criar um blog eficiente",
    description: "Dicas práticas para manter um blog atualizado e relevante",
    status: "idea",
    channel: "blog",
    tags: ["escrita", "conteúdo", "dicas"],
    dueDate: "2023-06-25",
  },
  {
    id: "2",
    title: "Tendências de React em 2023",
    description: "Um overview das principais novidades do React",
    status: "writing",
    channel: "blog",
    tags: ["react", "frontend", "javascript"],
    dueDate: "2023-06-28",
  },
  {
    id: "3",
    title: "Dicas de produtividade para dev",
    description: "Como organizar seu tempo e entregar mais",
    status: "review",
    channel: "blog",
    tags: ["produtividade", "carreira"],
    dueDate: "2023-06-22",
  },
  {
    id: "4",
    title: "Tour pelo meu setup",
    description: "Mostrando meu ambiente de trabalho",
    status: "idea",
    channel: "youtube",
    tags: ["setup", "hardware"],
    dueDate: "2023-06-30",
  },
  {
    id: "5",
    title: "Explicando Hooks em 60s",
    description: "Guia rápido sobre React Hooks",
    status: "writing",
    channel: "videos",
    tags: ["react", "tutorial", "rápido"],
    dueDate: "2023-06-23",
  },
  {
    id: "6",
    title: "Vagas em tecnologia",
    description: "Como está o mercado de trabalho atualmente",
    status: "done",
    channel: "linkedin",
    tags: ["carreira", "mercado"],
    dueDate: "2023-06-18",
  },
  {
    id: "7",
    title: "Clean Code em 5 passos",
    description: "Princípios básicos para escrever código limpo",
    status: "done",
    channel: "videos",
    tags: ["código", "boas práticas"],
    dueDate: "2023-06-15",
  },
];

export function KanbanBoard() {
  const [cards, setCards] = useState(mockCards);
  const [selectedChannel, setSelectedChannel] = useState("blog");
  const [showFilters, setShowFilters] = useState(false);
  const [openNewContent, setOpenNewContent] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleDragEnd = (cardId: string, newStatus: string) => {
    setCards(
      cards.map((card) =>
        card.id === cardId ? { ...card, status: newStatus } : card
      )
    );
    
    toast({
      title: "Card atualizado",
      description: "Status atualizado com sucesso.",
    });
  };

  const filteredCards = cards.filter(
    (card) => card.channel === selectedChannel
  );

  const renderColumns = () => {
    return columns.map((column) => (
      <KanbanColumn 
        key={column.id} 
        id={column.id} 
        title={column.name} 
        onDrop={(cardId) => handleDragEnd(cardId, column.id)}
      >
        {filteredCards
          .filter((card) => card.status === column.id)
          .map((card) => (
            <KanbanCard key={card.id} card={card} />
          ))}
      </KanbanColumn>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Select 
            value={selectedChannel} 
            onValueChange={setSelectedChannel}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione um canal" />
            </SelectTrigger>
            <SelectContent>
              {channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={showFilters ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-1"
            >
              {showFilters ? <FilterX className="h-4 w-4" /> : <ListFilter className="h-4 w-4" />}
              <span>{showFilters ? "Limpar filtros" : "Filtros"}</span>
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={() => setOpenNewContent(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Conteúdo</span>
        </Button>
      </div>
      
      {showFilters && <KanbanFilters />}
      
      <div className="mt-6">
        <Tabs defaultValue="kanban">
          <TabsList className="mb-4">
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban" className="mt-0">
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-4 gap-4'}`}>
              {renderColumns()}
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <div className="rounded-md border">
              {/* List view implementation will be added later */}
              <div className="p-8 text-center text-muted-foreground">
                Visualização em lista será implementada em breve.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <NewContentDialog open={openNewContent} onOpenChange={setOpenNewContent} />
    </div>
  );
}
