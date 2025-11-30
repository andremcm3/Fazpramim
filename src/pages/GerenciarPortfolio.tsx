import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PortfolioPhoto {
  id: number;
  photo: string;
  title: string;
  description: string;
}

const GerenciarPortfolio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portfolioPhotos, setPortfolioPhotos] = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novaFoto, setNovaFoto] = useState<File | null>(null);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState<PortfolioPhoto | null>(null);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const resp = await fetch('https://fazpramim-back.onrender.com/api/accounts/providers-edit/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data?.portfolio_photos)) {
          setPortfolioPhotos(data.portfolio_photos);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar portfólio:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seu portfólio.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNovaFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdicionarFoto = async () => {
    if (!novaFoto) {
      toast({
        title: 'Atenção',
        description: 'Selecione uma foto para adicionar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const formData = new FormData();
      formData.append('photo', novaFoto);
      if (novoTitulo) formData.append('title', novoTitulo);
      if (novaDescricao) formData.append('description', novaDescricao);

      // Debug conforme sugestão do backend
      console.log('📋 FormData entries:');
      for (const [k, v] of formData.entries()) {
        console.log(k, v);
      }

      const resp = await fetch('https://fazpramim-back.onrender.com/api/accounts/portfolio/add/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      if (resp.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Foto adicionada ao portfólio.',
        });
        setDialogOpen(false);
        setNovaFoto(null);
        setNovoTitulo('');
        setNovaDescricao('');
        setPreviewUrl(null);
        loadPortfolio();
      } else {
        const error = await resp.text();
        console.error('Erro ao adicionar foto:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível adicionar a foto.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao adicionar a foto.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoverFoto = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta foto?')) return;

    try {
      setIsDeletingId(id);
      const token = localStorage.getItem('token');
      if (!token) return;

      const resp = await fetch(`https://fazpramim-back.onrender.com/api/accounts/portfolio/${id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (resp.ok) {
        toast({
          title: 'Removido',
          description: 'Foto removida do portfólio.',
        });
        loadPortfolio();
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível remover a foto.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao remover a foto.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const getPhotoUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `https://fazpramim-back.onrender.com${path}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => navigate("/perfil-prestador")} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Perfil
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Gerenciar Portfólio</h1>
              <p className="text-muted-foreground mt-1">Adicione fotos dos seus trabalhos realizados</p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Foto
            </Button>
          </div>

          {/* Grid de Fotos */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Fotos ({portfolioPhotos.length})</CardTitle>
              <CardDescription>Clique no ícone de lixeira para remover uma foto</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : portfolioPhotos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Nenhuma foto no portfólio ainda.</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Foto
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioPhotos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden">
                      <div className="relative aspect-square bg-gray-100">
                        <img
                          src={getPhotoUrl(photo.photo)}
                          alt={photo.title || 'Trabalho'}
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => { setViewerPhoto(photo); setViewerOpen(true); }}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoverFoto(photo.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-lg truncate">
                          {photo.title || 'Sem título'}
                        </h3>
                        {photo.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {photo.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dialog para Adicionar Foto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Foto</DialogTitle>
            <DialogDescription>
              Escolha uma foto e adicione informações sobre o trabalho realizado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo-upload">Foto *</Label>
              <Input
                id="photo-upload"
                type="file"
                name="photo"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileChange}
                className="mt-2"
              />
              {previewUrl && (
                <div className="mt-4 relative aspect-square max-w-[200px] mx-auto">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg border" />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                placeholder="Ex: Instalação de ar condicionado"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva o trabalho realizado..."
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                maxLength={500}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionarFoto} disabled={!novaFoto || isUploading}>
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Adicionar ao Portfólio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Viewer de Imagem */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{viewerPhoto?.title || 'Visualizar imagem'}</DialogTitle>
            <DialogDescription>{viewerPhoto?.description}</DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {viewerPhoto && (
              <img
                src={getPhotoUrl(viewerPhoto.photo)}
                alt={viewerPhoto.title || 'Imagem do portfólio'}
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewerOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default GerenciarPortfolio;
