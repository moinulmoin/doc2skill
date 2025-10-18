'use client';

import { useState, useEffect } from 'react';
import { useOpenPanel } from '@openpanel/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Loader2, Sparkles, FileText, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Preset {
  name: string;
  description: string;
  base_url: string;
}

interface Job {
  status: string;
  progress: number;
  message: string;
  download_url?: string;
  error?: string;
}

interface Skill {
  name: string;
  size: number;
  created: number;
  download_url: string;
  url?: string;
  description?: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [presets, setPresets] = useState<Record<string, Preset>>({});
  const [selectedPreset, setSelectedPreset] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [enhance, setEnhance] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const op = useOpenPanel();

  useEffect(() => {
    fetch(`${API_URL}/api/presets`)
      .then(res => res.json())
      .then(data => setPresets(data.presets || {}))
      .catch(err => console.error('Failed to load presets:', err));

    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await fetch(`${API_URL}/api/skills`);
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/jobs/${jobId}`);
        const data = await res.json();
        setJob(data);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
          loadSkills();

          // Track completion or failure
          if (data.status === 'completed') {
            op?.track('skill_creation_completed', {
              skill_name: name,
              doc_url: url
            });
          } else if (data.status === 'failed') {
            op?.track('skill_creation_failed', {
              skill_name: name,
              error_message: data.error || 'Unknown error'
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch job status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  const handlePresetSelect = (presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      // Track preset selection
      op?.track('preset_selected', {
        preset_name: presetName,
        base_url: preset.base_url
      });

      setSelectedPreset(presetName);
      setUrl(preset.base_url);
      setName(preset.name);
      setDescription(preset.description);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setJobId(null);
    setJob(null);

    // Track skill creation started
    op?.track('skill_creation_started', {
      skill_name: name,
      doc_url: url,
      has_description: !!description,
      ai_enhancement_enabled: enhance,
      preset_used: selectedPreset || 'custom'
    });

    try {
      const payload: any = {
        url,
        name,
        description,
        enhance
      };

      if (selectedPreset && presets[selectedPreset]) {
        payload.config = presets[selectedPreset];
      }

      const res = await fetch(`${API_URL}/api/create-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setJobId(data.job_id);
    } catch (err) {
      console.error('Failed to create skill:', err);

      // Track failure
      op?.track('skill_creation_failed', {
        skill_name: name,
        error_message: String(err)
      });

      alert('Failed to create skill');
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const trackDownload = (skillName: string, skillSize: number, skillUrl?: string) => {
    op?.track('skill_download', {
      skill_name: skillName,
      file_size_kb: (skillSize / 1024).toFixed(1),
      doc_url: skillUrl,
      download_source: 'skill_gallery'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doc2Skill</h1>
              <p className="text-sm text-gray-600">Transform documentation into Claude Skill</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Create Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Skill</CardTitle>
            <CardDescription>
              Choose a preset or enter a custom documentation URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Presets */}
            <div className="space-y-3">
              <Label>Quick Start Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.keys(presets).map(presetName => (
                  <Button
                    key={presetName}
                    variant={selectedPreset === presetName ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePresetSelect(presetName)}
                    className="justify-start"
                  >
                    {presetName}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Documentation URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://react.dev/"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Skill Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="react"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="React framework for UIs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="enhance" className="text-base">
                    AI Enhancement
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use AI to create comprehensive skill documentation with examples
                  </p>
                </div>
                <Switch
                  id="enhance"
                  checked={enhance}
                  onCheckedChange={setEnhance}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !url || !name}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Skill
                  </>
                )}
              </Button>

              {/* Time estimate warning */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900">
                    Processing Time
                  </p>
                  <p className="text-sm text-amber-700">
                    Skill creation may take up to 20 minutes depending on documentation size and AI enhancement settings.
                  </p>
                </div>
              </div>
            </form>

            {/* Job Status */}
            {job && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'failed' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{job.message}</p>

                  {job.error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                      {job.error}
                    </div>
                  )}

                  {job.download_url && (
                    <Button
                      asChild
                      className="w-full"
                      size="lg"
                    >
                      <a
                        href={`${API_URL}${job.download_url}`}
                        download
                        onClick={() => trackDownload(name, 0, url)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download {name}.zip
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Skills Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Generated Skills</h2>
            <Badge variant="secondary" className="text-sm">
              {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
            </Badge>
          </div>

          {skills.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No skills generated yet. Create your first one above! 👆
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map(skill => (
                <Card key={skill.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{skill.name}</span>
                    </CardTitle>
                    {skill.description && (
                      <CardDescription className="line-clamp-2">
                        {skill.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2.5 text-sm">
                      {skill.url && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <ExternalLink className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <a
                            href={skill.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate hover:text-blue-600 hover:underline"
                          >
                            {skill.url}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Download className="h-4 w-4 flex-shrink-0" />
                        <span>{formatBytes(skill.size)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{formatDate(skill.created)}</span>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full"
                      size="lg"
                    >
                      <a
                        href={`${API_URL}${skill.download_url}`}
                        download
                        onClick={() => trackDownload(skill.name, skill.size, skill.url)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-16 py-8 border-t bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-medium text-gray-900">Doc2Skill</p>
          <p className='text-muted text-sm'>Transform documentation into Claude Skill</p>
          <p className="text-xs text-muted-foreground">
            Built by{' '}
            <a
              href="https://moinulmoin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Moinul Moin
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
