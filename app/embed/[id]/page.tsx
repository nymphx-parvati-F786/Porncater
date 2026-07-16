import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import VideoPlayer from "@/src/components/ui/player/VideoPlayer";

const prisma = new PrismaClient();

interface EmbedProps {
  params: Promise<{ id: string }>;
}

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
    // Completely overrides the RootLayout's constraints to force a 100vw/100vh raw black box
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