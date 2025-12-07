import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const updatePaymentStatus = async () => {
      const paymentId = searchParams.get("payment_id");

      if (paymentId) {
        try {
          await supabase
            .from("payments")
            .update({ status: "cancelled" })
            .eq("id", paymentId);
        } catch (error) {
          console.error("Error updating payment:", error);
        }
      }
    };

    updatePaymentStatus();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-scale-in">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-3xl font-serif text-primary mb-4">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground text-lg">
            Your payment was not completed. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate("/pricing")}
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Need help? Contact our support team.
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
