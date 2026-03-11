import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResumePreviewCardProps {
  preview: string;
}

export const ResumePreviewCard = ({ preview }: ResumePreviewCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Предпросмотр резюме</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="whitespace-pre-wrap text-sm text-foreground">{preview}</div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-card/90 backdrop-blur-[1px]" />
      </CardContent>
    </Card>
  );
};
