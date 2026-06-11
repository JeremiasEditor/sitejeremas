"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Eye, RotateCw, LogOut } from "lucide-react";

interface Video {
  id: number;
  title: string;
  description: string;
  client: string;
  type: string;
  fileName: string;
  url: string;
  uploadedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client: "",
    type: "Portfolio",
    file: null as File | null,
  });

  // Carregar vídeos ao montar
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setVideos(data);
    } catch (error) {
      console.error("Error loading videos:", error);
      setMessage("Erro ao carregar vídeos");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setMessage("Arquivo muito grande! Máximo 500MB");
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file || !formData.title) {
      setMessage("Preencha título e selecione um vídeo");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      data.append("file", formData.file);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("client", formData.client);
      data.append("type", formData.type);

      const res = await fetch("/api/videos", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Falha ao fazer upload");

      setMessage("✅ Vídeo enviado com sucesso!");
      setFormData({
        title: "",
        description: "",
        client: "",
        type: "Portfolio",
        file: null,
      });

      // Resetar input file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await loadVideos();
    } catch (error) {
      setMessage("❌ Erro ao enviar vídeo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, fileName: string) => {
    if (!confirm("Tem certeza que deseja deletar este vídeo?")) return;

    try {
      const res = await fetch("/api/videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fileName }),
      });

      if (!res.ok) throw new Error("Falha ao deletar");

      setMessage("✅ Vídeo deletado com sucesso!");
      await loadVideos();
    } catch (error) {
      setMessage("❌ Erro ao deletar vídeo");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header com Logout */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">📹 Gerenciador de Vídeos</h1>
            <p className="text-white/60">Faça upload e gerencie os vídeos do seu portfólio</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-white/70 hover:text-white transition"
            >
              🖼️ Imagens
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
              title="Sair da área de admin"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload size={20} /> Upload de Vídeo
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Roblox Gameplay"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cliente
                  </label>
                  <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    placeholder="Ex: Carlos Santana"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-red-500"
                  >
                    <option>Portfolio</option>
                    <option>Reel Viral</option>
                    <option>Vlog</option>
                    <option>Documentário</option>
                    <option>Conteúdo Institucional</option>
                  </select>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descrição do vídeo..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Upload de Arquivo */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Arquivo MP4 * (Máx: 500MB)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-red-500 cursor-pointer file:mr-2 file:px-3 file:py-1 file:bg-red-600 file:text-white file:rounded file:border-0 file:cursor-pointer"
                  />
                  {formData.file && (
                    <p className="text-sm text-green-400 mt-2">
                      ✓ {formData.file.name}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                {message && (
                  <div className="p-3 rounded bg-slate-800/50 border border-slate-700 text-sm">
                    {message}
                  </div>
                )}

                {/* Botão Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded font-medium hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RotateCw size={16} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Enviar Vídeo
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de Vídeos */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                Vídeos Salvos ({videos.length})
              </h2>

              {videos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/60">Nenhum vídeo salvo ainda</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-slate-800/50 border border-slate-700 rounded p-4 hover:border-red-500/50 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{video.title}</h3>
                          <div className="text-sm text-white/60 mt-1 space-y-1">
                            {video.client && (
                              <p>👤 {video.client}</p>
                            )}
                            <p>🏷️ {video.type}</p>
                            <p className="text-xs text-white/40">
                              {new Date(video.uploadedAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-700 hover:bg-blue-600 rounded transition"
                            title="Assistir"
                          >
                            <Eye size={16} />
                          </a>
                          <button
                            onClick={() => handleDelete(video.id, video.fileName)}
                            className="p-2 bg-slate-700 hover:bg-red-600 rounded transition"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
