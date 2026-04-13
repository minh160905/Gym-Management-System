import { useListWorkouts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TrainerWorkouts() {
  const { data: workouts, isLoading } = useListWorkouts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workout Plans</h1>
          <p className="text-muted-foreground mt-2">Custom workout templates for clients.</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> New Plan</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
        ) : workouts?.map((workout) => (
          <Card key={workout.id}>
            <CardHeader>
              <CardTitle>{workout.name}</CardTitle>
              <CardDescription>For: {workout.memberName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Goal</span>
                  <div className="font-medium">{workout.goal || '-'}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <div className="font-medium">{workout.durationWeeks} weeks</div>
                </div>
                <Button variant="outline" className="w-full">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
