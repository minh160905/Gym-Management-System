import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function CustomerMembership() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Membership</h1>
        <p className="text-muted-foreground mt-2">View and manage your subscription.</p>
      </div>

      <Card className="max-w-md border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pro Plan</CardTitle>
            <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Active</span>
          </div>
          <CardDescription>Your current subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <span className="text-4xl font-bold">$49.99</span>
            <span className="text-muted-foreground">/mo</span>
          </div>
          <ul className="space-y-2 text-sm mb-6">
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
              <span>Full gym access 24/7</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
              <span>All standard fitness classes</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
              <span>1 Personal Training session per month</span>
            </li>
          </ul>
          <div className="text-sm text-muted-foreground border-t pt-4">
            Next billing date: <strong>{new Date(Date.now() + 15 * 86400000).toLocaleDateString()}</strong>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" className="flex-1">Change Plan</Button>
          <Button variant="destructive" className="flex-1">Cancel</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
