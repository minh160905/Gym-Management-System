import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useListBookings, useListClasses, useListSessions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isAfter, isBefore } from "date-fns";
import { Calendar, User, Clock, MapPin, CheckCircle } from "lucide-react";

interface ScheduleEvent {
  id: string;
  type: "class" | "pt";
  title: string;
  category: string;
  scheduledAt: Date;
  durationMinutes: number;
  trainerName: string | null;
  location: string | null;
  status: string;
  recurrenceText?: string;
}

export default function CustomerSchedule() {
  const { memberId } = useAuth();
  const now = new Date();
  
  // Fetch class bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useListBookings({ 
    memberId: memberId ?? undefined, 
    status: "confirmed" 
  });
  
  // Fetch classes details
  const { data: classes = [], isLoading: classesLoading } = useListClasses();
  
  // Fetch PT sessions
  const { data: ptSessions = [], isLoading: sessionsLoading } = useListSessions({ 
    memberId: memberId ?? undefined 
  });

  const isLoading = bookingsLoading || classesLoading || sessionsLoading;

  // Merge and transform into schedule events
  const events: ScheduleEvent[] = [];

  // 1. Add class bookings
  bookings.forEach(booking => {
    const cls = classes.find(c => c.id === booking.classId);
    if (cls) {
      const classStart = new Date(cls.scheduledAt);
      const classEnd = cls.endDate ? new Date(cls.endDate) : new Date(classStart.getTime() + 12 * 7 * 24 * 60 * 60 * 1000);
      
      let scheduledAt = classStart;
      const daysVi = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const dayName = daysVi[classStart.getDay()];
      const timeStr = format(classStart, "HH:mm");
      const recurrenceText = `${dayName} hàng tuần lúc ${timeStr} (Từ ${format(classStart, "dd/MM/yyyy")} đến ${format(classEnd, "dd/MM/yyyy")})`;

      if (classEnd.getTime() > now.getTime()) {
        // Class has not ended yet: calculate the next occurrence date
        let occurrenceDate = new Date(classStart);
        while (occurrenceDate.getTime() < now.getTime()) {
          occurrenceDate.setDate(occurrenceDate.getDate() + 7);
        }
        if (occurrenceDate.getTime() <= classEnd.getTime()) {
          scheduledAt = occurrenceDate;
        } else {
          scheduledAt = classEnd;
        }
      }

      events.push({
        id: `class-${booking.id}`,
        type: "class",
        title: cls.name,
        category: cls.category ?? "Lớp học",
        scheduledAt,
        durationMinutes: cls.durationMinutes ?? 60,
        trainerName: cls.trainerName || "Chưa có",
        location: cls.location || "Phòng tập nhóm",
        status: booking.status,
        recurrenceText,
      });
    }
  });

  // 2. Add PT sessions
  ptSessions.forEach(session => {
    events.push({
      id: `pt-${session.id}`,
      type: "pt",
      title: `Tập cá nhân cùng PT`,
      category: "Personal Training",
      scheduledAt: new Date(session.scheduledAt),
      durationMinutes: session.durationMinutes ?? 60,
      trainerName: session.trainerName || "Huấn luyện viên",
      location: session.location || "Khu PT",
      status: session.status,
    });
  });

  // Sort events chronologically (nearest future or past first depending on type)
  // We'll sort ascending (from earliest to latest)
  events.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const upcomingEvents = events.filter(e => isAfter(e.scheduledAt, now) || e.status === "scheduled");
  const pastEvents = events.filter(e => isBefore(e.scheduledAt, now) && e.status !== "scheduled");

  const renderEventTable = (eventList: ScheduleEvent[]) => {
    if (eventList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-border">
          <Calendar className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium">Không tìm thấy lịch tập luyện nào.</p>
        </div>
      );
    }

    return (
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại lịch</TableHead>
                <TableHead>Thời gian tập luyện</TableHead>
                <TableHead>Nội dung / Lớp học</TableHead>
                <TableHead>Huấn luyện viên</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventList.map((event) => {
                const isClass = event.type === "class";
                return (
                  <TableRow key={event.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Badge 
                        variant={isClass ? "default" : "secondary"} 
                        className={`font-semibold ${isClass ? "bg-primary/10 text-primary border-primary/20" : "bg-purple-500/10 text-purple-600 border-purple-500/20"}`}
                      >
                        {isClass ? "Lớp nhóm" : "Buổi tập PT"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-black">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>
                          {format(event.scheduledAt, 'dd/MM/yyyy · HH:mm')} ({event.durationMinutes} phút)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-bold text-sm text-black">{event.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{event.category}</div>
                        {event.recurrenceText && (
                          <div className="text-xs text-zinc-500 mt-1 italic font-normal normal-case">
                            Lịch học: {event.recurrenceText}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{event.trainerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{event.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.status === "completed" || event.status === "confirmed" ? "default" : "secondary"} className="text-xs font-normal">
                        {event.status === "confirmed" || event.status === "scheduled" ? "Đã đặt lịch" : event.status === "completed" ? "Đã hoàn thành" : event.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">Lịch tập luyện của tôi</h1>
        <p className="text-muted-foreground mt-2">Theo dõi toàn bộ lịch học nhóm và lịch tập cá nhân cùng PT của bạn.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-20 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-3">
            <TabsTrigger value="upcoming">Sắp tới ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Đã qua ({pastEvents.length})</TabsTrigger>
            <TabsTrigger value="all">Tất cả ({events.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {renderEventTable(upcomingEvents)}
          </TabsContent>
          
          <TabsContent value="past" className="mt-4 space-y-4">
            {renderEventTable(pastEvents)}
          </TabsContent>
          
          <TabsContent value="all" className="mt-4 space-y-4">
            {renderEventTable(events)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
