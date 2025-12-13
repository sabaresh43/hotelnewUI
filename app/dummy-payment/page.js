"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function DummyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const paymentId = searchParams.get("payment_id");
  const amount = searchParams.get("amount");
  const email = searchParams.get("email");
  const name = searchParams.get("name");
  const bookingId = searchParams.get("booking_id");
  const returnUrl = searchParams.get("return_url");

  const handlePayment = async (status) => {
    setProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (status === "success") {
        // Call webhook to update booking status
        await fetch("/api/dummy-payment/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_id: paymentId,
            booking_id: bookingId,
            status: "completed",
            amount,
          }),
        });

        toast({
          title: "Payment Successful! 🎉",
          description: "Your payment has been processed successfully.",
          variant: "default",
        });

        // Redirect to success page
        setTimeout(() => {
          const successUrl = new URLSearchParams({
            title: "Payment Successful",
            message: "Your booking has been confirmed!",
            callbackUrl: `/user/my_bookings/hotels/${bookingId}`,
            callbackTitle: "View Booking",
          });
          router.push(`/success?${successUrl.toString()}`);
        }, 1000);
      } else {
        toast({
          title: "Payment Failed",
          description: "Your payment was not processed. Please try again.",
          variant: "destructive",
        });

        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: "An error occurred during payment processing.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">
              Dummy Payment Gateway
            </CardTitle>
          </div>
          <p className="text-center text-sm text-blue-100">
            Test Payment Portal
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Payment Details */}
          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-700">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-xs">{paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-xs">{bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold text-gray-700">Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  ${amount}
                </span>
              </div>
            </div>
          </div>

          {/* Test Payment Notice */}
          <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4">
            <p className="text-center text-sm font-medium text-yellow-800">
              ⚠️ This is a test payment gateway for development purposes only.
              No real transactions will occur.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handlePayment("success")}
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {processing ? "Processing..." : "Simulate Successful Payment"}
            </Button>

            <Button
              onClick={() => handlePayment("failed")}
              disabled={processing}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <XCircle className="mr-2 h-5 w-5" />
              Simulate Failed Payment
            </Button>

            <Button
              onClick={() => router.back()}
              disabled={processing}
              variant="outline"
              className="w-full"
            >
              Cancel & Go Back
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-xs text-gray-500">
            <p>Click one of the buttons above to simulate a payment result</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
