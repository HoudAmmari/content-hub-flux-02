
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { NewsItem } from "@/models/types";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Check, Send } from "lucide-react";
import { getNews, updateNewsSelectionStatus } from "@/services/newsService";
import { newsletterService } from "@/services/newsletterService";

export default function Newsletter() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsletterContent, setNewsletterContent] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("select");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const data = await getNews();
      setNews(data);
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notícias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNews = async (newsId: string, selected: boolean) => {
    try {
      await updateNewsSelectionStatus(newsId, selected);
      
      // Update local state
      setNews(prev => 
        prev.map(item => 
          item.id === newsId 
            ? { ...item, selected } 
            : item
        )
      );
      
      toast({
        title: selected ? "Adicionado" : "Removido",
        description: selected ? "Notícia adicionada à newsletter." : "Notícia removida da newsletter.",
      });
    } catch (error) {
      console.error("Erro ao atualizar seleção:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a seleção.",
        variant: "destructive",
      });
    }
  };

  const generateNewsletter = async () => {
    setIsLoading(true);
    try {
      const content = await newsletterService.getNewsletterContent();
      setNewsletterContent(content);
      setActiveTab("edit");
    } catch (error) {
      console.error("Erro ao gerar newsletter:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a newsletter.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendNewsletter = async () => {
    if (!subject.trim() || !recipients.trim() || !newsletterContent.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para enviar a newsletter.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const recipientsList = recipients.split(",").map(email => email.trim());
      
      const result = await newsletterService.sendNewsletter({
        recipients: recipientsList,
        subject,
        content: newsletterContent
      });
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Newsletter enviada com sucesso!",
        });
        
        // Reset form
        setNewsletterContent("");
        setRecipients("");
        setSubject("");
        setActiveTab("select");
      } else {
        throw new Error(result.error || "Erro desconhecido ao enviar newsletter");
      }
    } catch (error) {
      console.error("Erro ao enviar newsletter:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a newsletter. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectedCount = news.filter(item => item.selected).length;

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("newsletter.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("newsletter.description")}
          </p>
        </div>
      </div>

      <Separator className="my-6" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="select">{t("newsletter.selectContent")}</TabsTrigger>
          <TabsTrigger value="edit" disabled={selectedCount === 0}>{t("newsletter.editNewsletter")}</TabsTrigger>
          <TabsTrigger value="send" disabled={!newsletterContent}>{t("newsletter.send")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="select" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {t("newsletter.contentSelection")} 
              <span className="ml-2 text-sm text-muted-foreground">
                ({selectedCount} {t("newsletter.selected")})
              </span>
            </h2>
            <Button 
              onClick={generateNewsletter} 
              disabled={selectedCount === 0 || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t("newsletter.generate")}
                </>
              )}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((item) => (
                <Card key={item.id} className={item.selected ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{item.summarizedTitle}</CardTitle>
                      <Checkbox 
                        checked={item.selected}
                        onCheckedChange={(checked) => handleSelectNews(item.id, checked === true)}
                      />
                    </div>
                    <CardDescription>{item.source}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{item.summary}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noreferrer">
                        {t("newsletter.viewSource")}
                      </a>
                    </Button>
                    <Button 
                      size="sm" 
                      variant={item.selected ? "default" : "outline"}
                      onClick={() => handleSelectNews(item.id, !item.selected)}
                    >
                      {item.selected ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          {t("newsletter.selected")}
                        </>
                      ) : (
                        t("newsletter.select")
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("newsletter.noNews")}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("newsletter.editContent")}</CardTitle>
              <CardDescription>
                {t("newsletter.editContentDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="subject">{t("newsletter.subject")}</Label>
                  <Input 
                    id="subject" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    placeholder={t("newsletter.subjectPlaceholder")}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="content">{t("newsletter.content")}</Label>
                    <Tabs defaultValue="write" className="w-[200px]">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="write">{t("newsletter.write")}</TabsTrigger>
                        <TabsTrigger value="preview">{t("newsletter.preview")}</TabsTrigger>
                      </TabsList>
                      <TabsContent value="write">
                        <textarea
                          id="content"
                          className="w-full min-h-[300px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                          value={newsletterContent}
                          onChange={(e) => setNewsletterContent(e.target.value)}
                          placeholder={t("newsletter.contentPlaceholder")}
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="border rounded-md p-4 min-h-[300px] bg-white prose max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {newsletterContent}
                          </ReactMarkdown>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("select")}
              >
                {t("general.back")}
              </Button>
              <Button onClick={() => setActiveTab("send")}>
                {t("newsletter.continue")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="send" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("newsletter.sendNewsletter")}</CardTitle>
              <CardDescription>
                {t("newsletter.sendNewsletterDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="recipients">{t("newsletter.recipients")}</Label>
                  <Input 
                    id="recipients" 
                    value={recipients} 
                    onChange={(e) => setRecipients(e.target.value)} 
                    placeholder={t("newsletter.recipientsPlaceholder")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("newsletter.recipientsHelp")}
                  </p>
                </div>
                <div>
                  <Label>{t("newsletter.summary")}</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("newsletter.subject")}:</span>
                      <span className="font-medium">{subject || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("newsletter.contentLength")}:</span>
                      <span className="font-medium">{newsletterContent.length} {t("newsletter.characters")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("newsletter.selectedNews")}:</span>
                      <span className="font-medium">{selectedCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("edit")}
              >
                {t("general.back")}
              </Button>
              <Button onClick={sendNewsletter} disabled={isSending}>
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {t("newsletter.send")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
