import { useState } from "react";
import {
  useListEquipment,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
  getListEquipmentQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Search, Wrench, CheckCircle2, XCircle, AlertTriangle,
  MoreHorizontal, Pencil, Trash2, Filter,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type EquipmentItem = {
  id: number;
  name: string;
  category: string;
  brand?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  condition: string;
  status: string;
  location?: string | null;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

const EMPTY_FORM = {
  name: "",
  category: "",
  brand: "",
  serialNumber: "",
  purchaseDate: "",
  condition: "good",
  status: "operational",
  location: "",
  lastMaintenanceDate: "",
  nextMaintenanceDate: "",
  notes: "",
};

function statusBadge(status: string) {
  switch (status) {
    case "operational":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 border hover:bg-emerald-500/20 gap-1">
          <CheckCircle2 className="w-3 h-3" /> Hoạt động
        </Badge>
      );
    case "maintenance":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 border hover:bg-amber-500/20 gap-1">
          <Wrench className="w-3 h-3" /> Bảo trì
        </Badge>
      );
    case "retired":
      return (
        <Badge className="bg-red-500/15 text-red-600 border-red-500/30 border hover:bg-red-500/20 gap-1">
          <XCircle className="w-3 h-3" /> Hết dùng
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function conditionBadge(condition: string) {
  switch (condition) {
    case "good":
      return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">Tốt</Badge>;
    case "fair":
      return <Badge variant="secondary" className="bg-amber-500/10 text-amber-700">Khá</Badge>;
    case "poor":
      return <Badge variant="secondary" className="bg-red-500/10 text-red-700">Kém</Badge>;
    default:
      return <Badge variant="secondary">{condition}</Badge>;
  }
}

function safeDate(d?: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "dd/MM/yyyy"); } catch { return d; }
}

export default function OwnerEquipment() {
  const { data: equipmentList = [], isLoading } = useListEquipment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createEq = useCreateEquipment();
  const updateEq = useUpdateEquipment();
  const deleteEq = useDeleteEquipment();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<EquipmentItem | null>(null);

  // Stats
  const operational = equipmentList.filter((e) => e.status === "operational").length;
  const maintenance = equipmentList.filter((e) => e.status === "maintenance").length;
  const retired = equipmentList.filter((e) => e.status === "retired").length;
  const total = equipmentList.length;

  // Categories
  const categories = Array.from(new Set(equipmentList.map((e) => e.category))).filter(Boolean);

  // Filtered list
  const filtered = equipmentList.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.brand ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const matchCat = categoryFilter === "all" || e.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  function openAdd() {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(item: EquipmentItem) {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      brand: item.brand ?? "",
      serialNumber: item.serialNumber ?? "",
      purchaseDate: item.purchaseDate ?? "",
      condition: item.condition,
      status: item.status,
      location: item.location ?? "",
      lastMaintenanceDate: item.lastMaintenanceDate ?? "",
      nextMaintenanceDate: item.nextMaintenanceDate ?? "",
      notes: item.notes ?? "",
    });
    setDialogOpen(true);
  }

  function nullIfEmpty(val: string) {
    return val.trim() === "" ? null : val.trim();
  }

  async function handleSave() {
    if (!form.name.trim() || !form.category.trim()) {
      toast({ title: "Validation error", description: "Name and Category are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      brand: nullIfEmpty(form.brand),
      serialNumber: nullIfEmpty(form.serialNumber),
      purchaseDate: nullIfEmpty(form.purchaseDate),
      condition: form.condition,
      status: form.status,
      location: nullIfEmpty(form.location),
      lastMaintenanceDate: nullIfEmpty(form.lastMaintenanceDate),
      nextMaintenanceDate: nullIfEmpty(form.nextMaintenanceDate),
      notes: nullIfEmpty(form.notes),
    };
    try {
      if (editingItem) {
        await updateEq.mutateAsync({ id: editingItem.id, data: payload });
        toast({ title: "Equipment updated", description: `"${payload.name}" has been saved.` });
      } else {
        await createEq.mutateAsync({ data: payload });
        toast({ title: "Equipment added", description: `"${payload.name}" has been added.` });
      }
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Could not save equipment.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteEq.mutateAsync({ id: deleteTarget.id });
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey() });
      toast({ title: "Deleted", description: `"${deleteTarget.name}" has been removed.` });
    } catch {
      toast({ title: "Error", description: "Could not delete equipment.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-muted-foreground mt-2">Quản lý thiết bị và lịch bảo trì trong phòng tập.</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm thiết bị
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tổng thiết bị</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-emerald-600 uppercase tracking-wide flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-emerald-600">{operational}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-amber-600 uppercase tracking-wide flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5" /> Bảo trì
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-amber-600">{maintenance}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-red-500 uppercase tracking-wide flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Hết dùng
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold text-red-500">{retired}</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance alert */}
      {maintenance > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>{maintenance}</strong> thiết bị đang trong trạng thái bảo trì. Vui lòng kiểm tra và cập nhật lịch sửa chữa.
          </span>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, thương hiệu, vị trí..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] gap-1">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="operational">Hoạt động</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                  <SelectItem value="retired">Hết dùng</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thiết bị</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Bảo trì tiếp theo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Không tìm thấy thiết bị nào.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      {item.brand && (
                        <div className="text-xs text-muted-foreground">{item.brand}</div>
                      )}
                      {item.serialNumber && (
                        <div className="text-xs text-muted-foreground font-mono">S/N: {item.serialNumber}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{conditionBadge(item.condition)}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm">{item.location || "—"}</TableCell>
                    <TableCell className="text-sm">
                      {item.nextMaintenanceDate ? (
                        <span className={
                          new Date(item.nextMaintenanceDate) < new Date()
                            ? "text-red-600 font-medium"
                            : "text-muted-foreground"
                        }>
                          {safeDate(item.nextMaintenanceDate)}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(item as EquipmentItem)}>
                            <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(item as EquipmentItem)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              Hiển thị {filtered.length} / {total} thiết bị
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên thiết bị <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Ví dụ: Máy chạy bộ"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Danh mục <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Ví dụ: Cardio, Weights..."
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thương hiệu</Label>
                <Input
                  placeholder="Technogym, Life Fitness..."
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Số serial</Label>
                <Input
                  placeholder="SN-XXXXXX"
                  value={form.serialNumber}
                  onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tình trạng</Label>
                <Select value={form.condition} onValueChange={(v) => setForm((f) => ({ ...f, condition: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Tốt</SelectItem>
                    <SelectItem value="fair">Khá</SelectItem>
                    <SelectItem value="poor">Kém</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái hoạt động</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Đang hoạt động</SelectItem>
                    <SelectItem value="maintenance">Đang bảo trì</SelectItem>
                    <SelectItem value="retired">Ngừng sử dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vị trí trong phòng tập</Label>
              <Input
                placeholder="Khu vực A, Tầng 1..."
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ngày mua</Label>
                <Input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Bảo trì lần cuối</Label>
                <Input
                  type="date"
                  value={form.lastMaintenanceDate}
                  onChange={(e) => setForm((f) => ({ ...f, lastMaintenanceDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Bảo trì tiếp theo</Label>
                <Input
                  type="date"
                  value={form.nextMaintenanceDate}
                  onChange={(e) => setForm((f) => ({ ...f, nextMaintenanceDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                placeholder="Thông tin thêm về thiết bị..."
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : editingItem ? "Lưu thay đổi" : "Thêm thiết bị"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thiết bị</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa <strong>"{deleteTarget?.name}"</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
