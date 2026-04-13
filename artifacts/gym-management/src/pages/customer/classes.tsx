import { useListClasses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function CustomerClasses() {
  const { data: classes, isLoading } = useListClasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book a Class</h1>
        <p className="text-muted-foreground mt-2">Find and enroll in upcoming fitness classes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
        ) : classes?.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              <CardTitle>{cls.name}</CardTitle>
              <CardDescription>{cls.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{format(new Date(cls.scheduledAt), 'MMM d, h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trainer:</span>
                  <span className="font-medium">{cls.trainerName || 'TBA'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="font-medium">{cls.capacity - cls.enrolledCount} spots left</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={cls.capacity <= cls.enrolledCount}>
                Book Class
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
