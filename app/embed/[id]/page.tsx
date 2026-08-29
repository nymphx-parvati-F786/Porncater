import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import VideoPlayer from "@/src/components/ui/player/VideoPlayer";
import type { Metadata } from "next";

interface EmbedProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EmbedPage({ params }: EmbedProps) {
  const resolvedParams = await params;
  const videoId = parseInt(resolvedParams.id);

  if (isNaN(videoId)) notFound();

  const video = await prisma.video.findUnique({
    where: { id: videoId, status: "PUBLISHED" },
    select: { videoUrl: true, thumbnail: true, title: true }
  });

  if (!video) notFound();

  return (
    <div style={{ margin: 0, padding: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: 'black' }}>
      <VideoPlayer 
        src={video.videoUrl} 
        poster={video.thumbnail} 
        title={video.title} 
        vastTagUrl="https://s.magsrv.com/v1/vast.php?idz=5945800" 
      />
    </div>
  );
}
