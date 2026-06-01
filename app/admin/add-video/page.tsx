'use client';

import { useState, useEffect } from 'react';

export default function AddVideoPage() {
  const [formData, setFormData] = useState({
    title: '',
    videoFilename: '',
    thumbnailFilename: '',
    duration: '',
    category: '',
    pornstarId: '',
  });

  const [pornstars, setPornstars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch pornstars for dropdown
  useEffect(() => {
    const fetchPornstars = async () => {
      try {
        const res = await fetch('/api/pornstars');
        const data = await res.json();
        setPornstars(data);
      } catch (error) {
        console.error('Failed to load pornstars');
      }
    };
    fetchPornstars();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          videoUrl: `/videos/${formData.videoFilename}`,
          thumbnail: `/thumbnails/${formData.thumbnailFilename}`,
          duration: formData.duration,
          category: formData.category,
          pornstarId: formData.pornstarId ? parseInt(formData.pornstarId) : null,
        }),
      });

      if (res.ok) {
        setMessage('✅ Video added successfully!');
        setFormData({
          title: '',
          videoFilename: '',
          thumbnailFilename: '',
          duration: '',
          category: '',
          pornstarId: '',
        });
      } else {
        setMessage('❌ Failed to add video');
      }
    } catch (error) {
      setMessage('❌ Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Add New Video</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Video Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Video Filename (e.g. video-Id_000013.mp4)"
            value={formData.videoFilename}
            onChange={(e) => setFormData({ ...formData, videoFilename: e.target.value })}
            className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
            required
          />
          <input
            type="text"
            placeholder="Thumbnail Filename (e.g. thmbnl_000013.png)"
            value={formData.thumbnailFilename}
            onChange={(e) => setFormData({ ...formData, thumbnailFilename: e.target.value })}
            className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Duration (e.g. 12:45)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
            required
          />
          <input
            type="text"
            placeholder="Category (e.g. Desi, Interracial)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
          />
        </div>

        <select
          value={formData.pornstarId}
          onChange={(e) => setFormData({ ...formData, pornstarId: e.target.value })}
          className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
        >
          <option value="">Select Pornstar (optional)</option>
          {pornstars.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 transition"
        >
          {loading ? 'Adding Video...' : 'Add Video to Database'}
        </button>

        {message && (
          <p className="text-center mt-4 text-lg">{message}</p>
        )}
      </form>
    </div>
  );
}