import { QRCodeSVG } from "qrcode.react";
import { CreditCard, Landmark, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type PaymentMethod = "credit_card" | "bank_transfer";
export type CardType = "visa" | "mastercard";

export interface CardData {
  cardType: CardType;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface PaymentSectionProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  cardData: CardData;
  onCardDataChange: (d: CardData) => void;
  amount: number;
  reference?: string;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: "credit_card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "bank_transfer", label: "Bank Transfer", icon: Landmark },
];

function formatCardNumber(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function PaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  cardData,
  onCardDataChange,
  amount,
  reference = "IRONFORGE-PAY",
}: PaymentSectionProps) {
  const qrValue = `IRONFORGE:BANK:REF:${reference}:AMT:${amount}:ACC:12-3456-78901234-00`;

  function update(patch: Partial<CardData>) {
    onCardDataChange({ ...cardData, ...patch });
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Payment Method</Label>

      {/* Method picker */}
      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onPaymentMethodChange(id)}
            className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
              paymentMethod === id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${paymentMethod === id ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-sm font-medium">{label}</span>
            {paymentMethod === id && <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />}
          </button>
        ))}
      </div>

      {/* Credit Card form */}
      {paymentMethod === "credit_card" && (
        <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
          {/* Card type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Card Type</Label>
            <div className="flex gap-2">
              {(["visa", "mastercard"] as CardType[]).map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => update({ cardType: ct })}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border py-2 text-sm font-semibold transition-colors ${
                    cardData.cardType === ct
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {ct === "visa" ? (
                    <span className="italic font-black tracking-tighter text-base">VISA</span>
                  ) : (
                    <span className="font-black text-sm">Mastercard</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Card number */}
          <div className="space-y-1.5">
            <Label className="text-xs">Card Number</Label>
            <Input
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={(e) => update({ cardNumber: formatCardNumber(e.target.value) })}
              maxLength={19}
              className="font-mono text-sm tracking-wider"
            />
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Expiry Date</Label>
              <Input
                placeholder="MM/YY"
                value={cardData.expiry}
                onChange={(e) => update({ expiry: formatExpiry(e.target.value) })}
                maxLength={5}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CVV</Label>
              <Input
                placeholder="•••"
                value={cardData.cvv}
                type="password"
                onChange={(e) => update({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                maxLength={4}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer QR */}
      {paymentMethod === "bank_transfer" && (
        <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <QRCodeSVG value={qrValue} size={140} level="M" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Scan with your banking app to pay
            </p>
          </div>
          <div className="border-t border-border pt-3 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Bank</span>
              <span className="font-medium text-foreground">Iron & Forge Fitness</span>
            </div>
            <div className="flex justify-between">
              <span>Account</span>
              <span className="font-medium text-foreground font-mono">12-3456-78901234-00</span>
            </div>
            <div className="flex justify-between">
              <span>Reference</span>
              <span className="font-medium text-foreground font-mono">{reference}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border mt-1">
              <span className="font-medium text-foreground">Amount</span>
              <span className="font-bold text-primary">${amount}.00</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
