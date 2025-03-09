
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchNews, updateNewsSelection, sendNewsletter } from "@/api/newsApi";
import { NewsItem } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { ExternalLink, Send } from "lucide-react";

const Newsletter = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  // Fetch news
  const { data: news, isLoading, error } = useQuery({
    queryKey: ["news"],
    queryFn: fetchNews,
  });

  // Update news selection
  const updateSelectionMutation = useMutation({
    mutationFn: ({ newsId, selected }: { newsId: string; selected: boolean }) => 
      updateNewsSelection(newsId, selected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("error_updating_selection"),
        variant: "destructive",
      });
    },
  });

  // Send newsletter
  const sendNewsletterMutation = useMutation({
    mutationFn: (selectedNewsIds: string[]) => sendNewsletter(selectedNewsIds),
    onSuccess: () => {
      toast({
        title: t("success"),
        description: t("newsletter_sent_successfully"),
      });
      setIsSending(false);
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("error_sending_newsletter"),
        variant: "destructive",
      });
      setIsSending(false);
    },
  });

  const handleToggleSelection = (newsItem: NewsItem) => {
    updateSelectionMutation.mutate({
      newsId: newsItem.id,
      selected: !newsItem.selected,
    });
  };

  const handleSendNewsletter = () => {
    if (!news) return;
    
    const selectedNewsIds = news
      .filter(item => item.selected)
      .map(item => item.id);
    
    if (selectedNewsIds.length === 0) {
      toast({
        title: t("warning"),
        description: t("no_news_selected"),
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    sendNewsletterMutation.mutate(selectedNewsIds);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{t("daily_newsletter")}</h1>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{t("daily_newsletter")}</h1>
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>{t("error")}</CardTitle>
            <CardDescription>{t("error_fetching_news")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["news"] })}
            >
              {t("try_again")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("daily_newsletter")}</h1>
        <Button 
          onClick={handleSendNewsletter} 
          disabled={isSending}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSending ? t("sending") : t("send_newsletter")}
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-muted-foreground">{t("select_news_for_newsletter")}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {t("selected_news_count", { count: news?.filter(item => item.selected).length || 0 })}
        </p>
      </div>

      <div className="grid gap-4">
        {news && news.map((newsItem) => (
          <Card key={newsItem.id} className={newsItem.selected ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Checkbox 
                      id={`select-${newsItem.id}`}
                      checked={newsItem.selected}
                      onCheckedChange={() => handleToggleSelection(newsItem)}
                    />
                    <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                      {newsItem.source}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{newsItem.summarizedTitle}</CardTitle>
                </div>
                <a 
                  href={newsItem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <p>{newsItem.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Newsletter;
