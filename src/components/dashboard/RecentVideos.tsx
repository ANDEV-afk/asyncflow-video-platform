import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/dashboard/EmptyState";

export type Recording = {
  id: string;
  title: string;
  duration: string;
  createdAt: string;
};

const ActualRecordings: Recording[] = [];

type RecentVideosProps = {
  recordings?: Recording[];
};

export default function RecentVideos({
  recordings = ActualRecordings,
}: RecentVideosProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">
        Recent Recordings
      </h2>

      {recordings.length === 0 ? (
        <EmptyState
          title="No recordings yet"
          description="Start your first async recording"
          actionLabel="Record Now"
          actionHref="/dashboard/record-new"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recordings.map((recording) => (
            <Card key={recording.id} className="overflow-hidden">
              <div className="aspect-video bg-muted" />
              <CardContent className="space-y-1 p-4">
                <p className="font-medium">{recording.title}</p>
                <p className="text-sm text-muted-foreground">
                  {recording.duration} · {recording.createdAt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
