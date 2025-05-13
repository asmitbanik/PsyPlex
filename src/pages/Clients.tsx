import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ClientService } from '@/services/ClientService';

export default function Clients() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // This simulates loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-therapy-purple" />
        <p className="ml-2 text-therapy-purple">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button>Add Client</Button>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((id) => (
          <div key={id} className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-2">Client {id}</h2>
            <p className="text-gray-600 mb-4">client{id}@example.com</p>
            <Button asChild>
              <Link to={`/therapist/clients/${id}`}>View Details</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
