import { NextResponse } from "next/server";
import { updateOneDoc } from "@/lib/db/updateOperationDB";
import { strToObjectId } from "@/lib/db/utilsDB";

/**
 * Dummy Payment Gateway - Webhook Handler
 * Handles payment status updates from the dummy payment gateway
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { payment_id, booking_id, status, amount } = body;

    console.log("🔔 Dummy Payment Webhook received:", {
      payment_id,
      booking_id,
      status,
      amount,
    });

    if (!booking_id || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: booking_id or status",
        },
        { status: 400 }
      );
    }

    // Update booking status based on payment status
    if (status === "completed") {
      try {
        // Update hotel booking
        await updateOneDoc(
          "HotelBooking",
          { _id: strToObjectId(booking_id) },
          {
            paymentStatus: "completed",
            bookingStatus: "confirmed",
            paymentMethod: "dummy_gateway",
            paymentId: payment_id,
            paidAt: new Date(),
          },
          ["hotelBookings"]
        );

        console.log("✅ Booking updated successfully:", booking_id);

        return NextResponse.json(
          {
            success: true,
            message: "Booking confirmed successfully",
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("❌ Error updating booking:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update booking",
          },
          { status: 500 }
        );
      }
    } else {
      // Payment failed - update booking status
      await updateOneDoc(
        "HotelBooking",
        { _id: strToObjectId(booking_id) },
        {
          paymentStatus: "failed",
          paymentMethod: "dummy_gateway",
          paymentId: payment_id,
        },
        ["hotelBookings"]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Payment failed status updated",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
