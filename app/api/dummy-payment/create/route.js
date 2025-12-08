import { NextResponse } from "next/server";

/**
 * Dummy Payment Gateway - Create Payment
 * This is a mock payment gateway for testing purposes
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, email, name, bookingId, returnUrl } = body;

    console.log("💳 Dummy Payment Gateway - Creating payment:", {
      amount,
      email,
      name,
      bookingId,
    });

    // Validate required fields
    if (!amount || !email || !bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: amount, email, or bookingId",
        },
        { status: 400 }
      );
    }

    // Generate a mock payment ID
    const paymentId = `dummy_payment_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create payment URL with query parameters
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    const paymentUrl = `${baseUrl}/dummy-payment?` + new URLSearchParams({
      payment_id: paymentId,
      amount: amount.toString(),
      email,
      name: name || "Guest",
      booking_id: bookingId,
      return_url: returnUrl || `${baseUrl}/success`,
    }).toString();

    console.log("✅ Dummy payment URL created:", paymentUrl);

    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      payment_url: paymentUrl,
      message: "Mock payment created successfully",
    });
  } catch (error) {
    console.error("❌ Dummy Payment Gateway error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create payment",
      },
      { status: 500 }
    );
  }
}
