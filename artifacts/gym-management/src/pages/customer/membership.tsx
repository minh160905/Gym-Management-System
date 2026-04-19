import { useListMemberships, useCreatePayment, useUpdateMember, getListMembershipsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function CustomerMembership() {
  const { memberId } = useAuth();
  const { data: plans, isLoading } = useListMemberships();
  const createPayment = useCreatePayment();
  const updateMember = useUpdateMember();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRegister = (planId: number, planName: string, price: number) => {
    if (!memberId) return;

    createPayment.mutate({
      data: {
        memberId,
        amount: price,
        description: `Payment for ${planName} Plan`,
        status: "paid",
        paymentDate: new Date().toISOString(),
        membershipPlanId: planId,
        paymentMethod: "credit_card",
      }
    }, {
      onSuccess: () => {
        updateMember.mutate({
          id: memberId,
          data: {
            membershipPlanId: planId
          }
        }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMembershipsQueryKey() });
            toast({ title: "Successfully registered", description: `You are now subscribed to the ${planName} Plan.` });
          }
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Membership</h1>
        <p className="text-muted-foreground mt-2">View available plans and register.</p>
      </div>

      {isLoading ? (
        <div>Loading plans...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan) => (
            <Card key={plan.id} className="flex flex-col border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                {plan.description && <CardDescription>{plan.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                {plan.features && (
                  <ul className="space-y-2 text-sm mb-6 text-muted-foreground">
                    {plan.features.split(',').map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                        <span>{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleRegister(plan.id, plan.name, plan.priceMonthly)}
                  disabled={createPayment.isPending || updateMember.isPending}
                >
                  Register
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
