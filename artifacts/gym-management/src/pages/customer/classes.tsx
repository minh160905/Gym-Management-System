import { useState } from "react";
import { useListClasses, useCreateBooking, getListClassesQueryKey, useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Check } from "lucide-react";

export default function CustomerClasses() {
  const { memberId } = useAuth();
  const { data: classes, isLoading: classesLoading } = useListClasses();
  const { data: bookings = [], isLoading: bookingsLoading } = useListBookings(
    { memberId: memberId ?? undefined },
    { query: { enabled: !!memberId } }
  );
  const createBookingMutation = useCreateBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [bookingClassId, setBookingClassId] = useState<number | null>(null);

  const isLoading = classesLoading || (!!memberId && bookingsLoading);

  async function handleBookClass(classId: number, className: string, currentEnrolled: number, capacity: number) {
    if (!memberId) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để đăng ký lớp học.",
        variant: "destructive",
      });
      return;
    }

    if (currentEnrolled >= capacity) {
      toast({
        title: "Đăng ký không thành công",
        description: `Lớp học "${className}" đã đầy chỗ.`,
        variant: "destructive",
      });
      return;
    }

    setBookingClassId(classId);

    try {
      await createBookingMutation.mutateAsync({
        data: {
          memberId: memberId,
          classId: classId,
        },
      });
      toast({
        title: "Đăng ký thành công",
        description: `Bạn đã đăng ký thành công lớp học "${className}".`,
      });
      queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey({ memberId: memberId ?? undefined }) });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Đăng ký không thành công.";
      toast({
        title: "Đăng ký không thành công",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setBookingClassId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đăng ký lớp học</h1>
        <p className="text-muted-foreground mt-2">Tìm kiếm và tham gia các lớp học thể hình sắp tới.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
        ) : classes?.map((cls) => {
          const isRegistered = bookings.some(
            (b) => b.classId === cls.id && b.status === "confirmed"
          );
          const isFull = cls.capacity <= cls.enrolledCount;
          const isProcessing = bookingClassId === cls.id;

          return (
            <Card key={cls.id} className={isFull && !isRegistered ? "border-red-500/20 bg-red-500/[0.01]" : isRegistered ? "border-emerald-500/20 bg-emerald-500/[0.01]" : ""}>
              <CardHeader>
                <CardTitle>{cls.name}</CardTitle>
                <CardDescription className="capitalize">{cls.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">{format(new Date(cls.scheduledAt), 'dd/MM/yyyy, hh:mm a')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Huấn luyện viên:</span>
                    <span className="font-medium">{cls.trainerName || 'Chưa có'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chỗ trống:</span>
                    <span className={`font-semibold ${isRegistered ? "text-emerald-500" : isFull ? "text-red-500" : "text-emerald-500"}`}>
                      {isRegistered ? "Đã đăng ký tham gia" : isFull ? "Hết chỗ" : `${cls.capacity - cls.enrolledCount} / ${cls.capacity} chỗ trống`}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${isRegistered ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/10 cursor-not-allowed opacity-100" : ""}`}
                  variant={isRegistered ? "outline" : (isFull ? "destructive" : "default")}
                  disabled={isProcessing || isRegistered}
                  onClick={() => handleBookClass(cls.id, cls.name, cls.enrolledCount, cls.capacity)}
                >
                  {isProcessing ? (
                    "Đang đăng ký..."
                  ) : isRegistered ? (
                    <span className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold">
                      <Check className="w-4 h-4 text-emerald-600 animate-pulse" /> Đã đăng ký
                    </span>
                  ) : isFull ? (
                    "Lớp đã đầy (Đăng ký)"
                  ) : (
                    "Đăng ký lớp học"
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
