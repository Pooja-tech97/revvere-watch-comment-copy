import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(true);

  useEffect(() => {
    const updatePaymentStatus = async () => {
      const sessionId = searchParams.get("session_id");
      const paymentId = searchParams.get("payment_id");

      if (paymentId) {
        try {
          await supabase
            .from("payments")
            .update({ 
              status: "completed",
              stripe_session_id: sessionId 
            })
            .eq("id", paymentId);
        } catch (error) {
          console.error("Error updating payment:", error);
        }
      }
      setUpdating(false);
    };

    updatePaymentStatus();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-scale-in">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-serif text-primary mb-4">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. Your wellness journey begins now.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate("/journal")}
            className="w-full"
            disabled={updating}
          >
            Start Journaling
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          A confirmation email has been sent to your inbox.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
