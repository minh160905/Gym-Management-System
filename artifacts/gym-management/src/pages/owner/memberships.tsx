import { useListMemberships } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerMemberships() {
  const { data: plans, isLoading } = useListMemberships();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membership Plans</h1>
          <p className="text-muted-foreground mt-2">Manage subscription tiers and pricing.</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> New Plan</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-[400px] rounded-xl" />)
        ) : plans?.map((plan) => (
          <Card key={plan.id} className={`relative flex flex-col ${!plan.isActive && 'opacity-60'}`}>
            {!plan.isActive && (
              <div className="absolute top-4 right-4 bg-muted px-2 py-1 rounded text-xs font-medium">Inactive</div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-2 text-sm">
                {plan.features?.split('\n').map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant={plan.isActive ? "outline" : "secondary"} className="w-full">
                Edit Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
