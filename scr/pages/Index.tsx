
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const match = inputValue.match(/(?:v=|\/)([\w-]{11})/);
      const id = match ? match[1] : inputValue.trim();
      setSearchParams({ v: id });
    }
  };

  const handleBack = () => {
    setSearchParams({});
    setVideoData(null);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Video Player View
  if (videoId) {
    if (loading) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-6">
            <Button variant="ghost" onClick={handleBack} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ホームに戻る
            </Button>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!videoData) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">動画が見つかりませんでした</h2>
            <Button onClick={handleBack}>ホームに戻る</Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <video controls autoPlay className="w-full h-full" src={selectedQuality}>
                  お使いのブラウザは動画タグをサポートしていません。
                </video>
              </div>

              {videoData.streamUrls && videoData.streamUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {videoData.streamUrls.map((stream, index) => (
                    <Button
                      key={index}
                      variant={selectedQuality === stream.url ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setSelectedQuality(stream.url)}
                    >
                      {stream.resolution}
                    </Button>
                  ))}
                </div>
              )}

              <Card className="p-6 space-y-4">
                <h1 className="text-2xl font-bold">{videoData.title}</h1>
                
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{formatViews(videoData.viewCount)} 回視聴</span>
                  </div>
                  {videoData.likeCount > 0 && (
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{formatViews(videoData.likeCount)}</span>
                    </div>
                  )}
                  <span>{formatDate(videoData.published)}</span>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  {videoData.authorThumbnails && videoData.authorThumbnails.length > 0 && (
                    <img
                      src={videoData.authorThumbnails[videoData.authorThumbnails.length - 1]?.url}
                      alt={videoData.author}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{videoData.author}</h3>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div
                    className="text-sm text-muted-foreground whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: videoData.description }}
                  />
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">関連動画</h3>
                <p className="text-sm text-muted-foreground">
                  関連動画機能は近日公開予定です
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home View
  const exampleVideos = [
    { id: "dQw4w9WgXcQ", title: "サンプル動画 1" },
    { id: "jNQXAC9IVRw", title: "サンプル動画 2" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="container relative mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold">
              <Play className="h-4 w-4" />
              動画プラットフォーム
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                YouTube動画を
              </span>
              <br />
              別の方法で再生
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Invidious APIを使用して、YouTube動画を取得・再生します
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="YouTube動画IDまたはURLを入力"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="h-12 text-lg bg-card border-border"
                />
                <Button type="submit" size="lg" className="h-12 px-8">
                  <Search className="h-5 w-5 mr-2" />
                  検索
                </Button>
              </div>
            </form>

            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">試してみる:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {exampleVideos.map((video) => (
                  <Button
                    key={video.id}
                    variant="secondary"
                    onClick={() => setSearchParams({ v: video.id })}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {video.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">高速再生</h3>
            <p className="text-muted-foreground">
              複数のInvidiousインスタンスを使用した高速な動画取得
            </p>
          </Card>

          <Card className="p-6 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">簡単検索</h3>
            <p className="text-muted-foreground">
              動画IDまたはURLを入力するだけで即座に再生
            </p>
          </Card>

          <Card className="p-6 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">複数画質</h3>
            <p className="text-muted-foreground">
              複数の解像度から選択可能（最大1080p対応）
            </p>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <Card className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-card to-secondary/50 border-primary/20">
          <h2 className="text-2xl font-bold mb-4 text-center">技術仕様</h2>
          <div className="space-y-3 text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Invidious APIを使用した動画取得
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              複数インスタンスの自動フェイルオーバー
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Lovable Cloud (Supabase Edge Functions)
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              React + TypeScript + Tailwind CSS
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
