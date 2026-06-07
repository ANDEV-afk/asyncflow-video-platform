import { generateSignedUrl } from "@/lib/generateSignedUrl";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const video =
    await prisma.video.findUnique({
      where: {
        shareId,
      },
    });

  if (!video) {
    notFound();
  }

  if (
    video.visibility === "PRIVATE"
  ) {
    notFound();
  }

  const signedUrl =
  await generateSignedUrl(
    video.s3key!
  );

  await prisma.video.update({
    where: {
      id: video.id,
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-4xl font-bold">
        {video.title}
      </h1>

      <p className="mt-2 text-muted-foreground">
        {video.description}
      </p>

      <p className="mt-2 text-sm">
        {video.viewCount} views
      </p>

      <video
        controls
        src={signedUrl}
        className="mt-6 w-full rounded-lg"
      />
    </div>
  );
}