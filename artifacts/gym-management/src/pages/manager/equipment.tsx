import { useState } from "react";
import { useListEquipment, useCreateEquipment, useUpdateEquipment, useDeleteEquipment, getListEquipmentQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  condition: z.string().min(1, "Condition is required"),
  status: z.string().min(1, "Status is required"),
  location: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

export default function ManagerEquipment() {
  const { data: equipment, isLoading } = useListEquipment();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createEq = useCreateEquipment();
  const updateEq = useUpdateEquipment();
  const deleteEq = useDeleteEquipment();

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      category: "",
      condition: "good",
      status: "operational",
      location: "",
    },
  });

  const handleOpenAdd = () => {
    form.reset({ name: "", category: "", condition: "good", status: "operational", location: "" });
    setEditingId(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    form.reset({
      name: item.name,
      category: item.category,
      condition: item.condition,
      status: item.status,
      location: item.location || "",
    });
    setEditingId(item.id);
    setIsAddOpen(true);
  };

  const onSubmit = (values: EquipmentFormValues) => {
    if (editingId) {
      updateEq.mutate({ id: editingId, data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey() });
          setIsAddOpen(false);
          toast({ title: "Equipment updated" });
        }
      });
    } else {
      createEq.mutate({ data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey() });
          setIsAddOpen(false);
          toast({ title: "Equipment added" });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this equipment?")) {
      deleteEq.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey() });
          toast({ title: "Equipment deleted" });
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational": return <Badge variant="outline" className="bg-primary/20 text-primary">Operational</Badge>;
      case "maintenance": return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600">Maintenance</Badge>;
      case "retired": return <Badge variant="outline" className="bg-destructive/20 text-destructive">Retired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "good": return <Badge variant="secondary">Good</Badge>;
      case "fair": return <Badge variant="secondary" className="bg-orange-500/20">Fair</Badge>;
      case "poor": return <Badge variant="secondary" className="bg-red-500/20">Poor</Badge>;
      default: return <Badge variant="secondary">{condition}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-muted-foreground mt-2">Manage gym equipment and maintenance status.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd}><Plus className="w-4 h-4 mr-2" /> Add Equipment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="condition" render={({ field }) => (
                    <FormItem><FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit">{editingId ? "Save Changes" : "Add Equipment"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : equipment?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{getConditionBadge(item.condition)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.location || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {equipment?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No equipment found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
