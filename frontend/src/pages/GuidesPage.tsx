import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/ui/card';
import { 
  BookOpen, 
  Languages, 
  Award,
  MoreVertical
} from 'lucide-react';
import axios from 'axios';

interface Guide {
  id: number;
  full_name: string;
  license_number: string;
  languages: string;
  specialization: string;
}

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/certified-guides', {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        });
        setGuides(response.data.data || []);
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Guías Certificados" 
        description="Gestión de profesionales autorizados por DIRCETUR."
        buttonLabel="Nuevo Guía"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)
        ) : (
          guides.map((guide) => (
            <Card key={guide.id} className="p-6 border-border flex flex-col items-center text-center relative group">
              <div className="absolute top-4 right-4">
                <MoreVertical className="w-4 h-4 text-muted-foreground cursor-pointer" />
              </div>

              <div className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Award className="w-10 h-10" />
              </div>

              <h3 className="font-bold text-lg">{guide.full_name}</h3>
              <p className="text-xs text-primary font-bold uppercase tracking-tighter mt-1">
                LIC: {guide.license_number}
              </p>

              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Languages className="w-4 h-4" />
                  <span>{guide.languages}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{guide.specialization}</span>
                </div>
              </div>

              <button className="mt-6 w-full py-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg text-sm font-bold transition-colors">
                Ver Perfil
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
