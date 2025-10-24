import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, Package, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Concept {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

interface Order {
  id: string;
  user_name: string;
  user_email: string;
  status: string;
  created_at: string;
  concepts: { name: string };
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!data) {
      navigate("/dashboard");
    } else {
      setIsAdmin(true);
      fetchConcepts();
      fetchOrders();
    }
  };

  const fetchConcepts = async () => {
    const { data } = await supabase
      .from("concepts")
      .select("*")
      .order("created_at", { ascending: false });
    setConcepts(data || []);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, concepts(name)")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingConcept) {
        const { error } = await supabase
          .from("concepts")
          .update({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
          })
          .eq("id", editingConcept.id);

        if (error) throw error;
        toast({ title: "Konsept oppdatert! ✅" });
      } else {
        const { error } = await supabase
          .from("concepts")
          .insert({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
          });

        if (error) throw error;
        toast({ title: "Konsept opprettet! 🎉" });
      }

      setDialogOpen(false);
      setFormData({ name: "", description: "", price: "" });
      setEditingConcept(null);
      fetchConcepts();
    } catch (error: any) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (concept: Concept) => {
    setEditingConcept(concept);
    setFormData({
      name: concept.name,
      description: concept.description,
      price: concept.price.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette dette konseptet?")) return;
    
    try {
      const { error } = await supabase
        .from("concepts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Konsept slettet" });
      fetchConcepts();
    } catch (error: any) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (concept: Concept) => {
    try {
      const { error } = await supabase
        .from("concepts")
        .update({ active: !concept.active })
        .eq("id", concept.id);

      if (error) throw error;
      toast({ title: concept.active ? "Konsept deaktivert" : "Konsept aktivert" });
      fetchConcepts();
    } catch (error: any) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Tilbake
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin Panel 🔧</h1>

          {/* Stats */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Aktive konsepter</CardTitle>
                <Package className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{concepts.filter(c => c.active).length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Totale bestillinger</CardTitle>
                <Users className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{orders.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Concepts Management */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Konsepter</CardTitle>
                  <CardDescription>Administrer alle spillkonsepter</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setEditingConcept(null);
                    setFormData({ name: "", description: "", price: "" });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-5 w-5" />
                      Nytt konsept
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingConcept ? "Rediger konsept" : "Opprett nytt konsept"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Navn</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Beskrivelse</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Pris (NOK)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {editingConcept ? "Oppdater" : "Opprett"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Navn</TableHead>
                    <TableHead>Beskrivelse</TableHead>
                    <TableHead>Pris</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Handlinger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {concepts.map((concept) => (
                    <TableRow key={concept.id}>
                      <TableCell className="font-medium">{concept.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{concept.description}</TableCell>
                      <TableCell>{concept.price} kr</TableCell>
                      <TableCell>
                        <Button
                          variant={concept.active ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleActive(concept)}
                        >
                          {concept.active ? "Aktiv" : "Inaktiv"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(concept)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(concept.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Bestillinger</CardTitle>
              <CardDescription>Oversikt over alle innkomne bestillinger</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dato</TableHead>
                    <TableHead>Navn</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Konsept</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{new Date(order.created_at).toLocaleDateString("nb-NO")}</TableCell>
                      <TableCell>{order.user_name}</TableCell>
                      <TableCell>{order.user_email}</TableCell>
                      <TableCell>{order.concepts.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm ${
                          order.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {order.status === "pending" ? "Ventende" : "Fullført"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;