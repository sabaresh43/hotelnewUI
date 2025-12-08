"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import hotelRoomReserveAction from "@/lib/actions/hotelRoomReserveAction";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle } from "lucide-react";
import validateGuestForm from "@/lib/zodSchemas/hotelGuestsFormValidation";
import Image from "next/image";

export default function BookingReview({ nextStep, hotelDetails, searchState }) {
  const router = useRouter();
  const pathname = usePathname();

  const searchInfo = {
    checkInDate: searchState.checkIn,
    checkOutDate: searchState.checkOut,
    nights: intervalToDuration({
      start: new Date(searchState.checkIn),
      end: new Date(searchState.checkOut),
    }).days,
  };

  const [guestInfo, setGuestInfo] = useState([]);
  const [hasGuestFormErrors, setHasGuestFormErrors] = useState(false);
  const [selectedRooms, setRooms] = useState([]);

  const strHotelDetails = JSON.stringify(hotelDetails);
  const strSearchState = JSON.stringify(searchState);

  useEffect(() => {
    const guestsDetails = JSON.parse(sessionStorage.getItem("guests") || "{}");
    const selectedRooms = JSON.parse(
      sessionStorage.getItem("selectedRooms") || "[]",
    );

    const guestsArr = Object.values(guestsDetails);
    const guestData = guestsArr.length
      ? guestsArr
      : Array(searchState.guests).fill({});

    let key = 0;
    let err = {};
    let data = {};
    for (const guestForm of guestData) {
      const validate = validateGuestForm(guestForm);
      if (validate.success === false) {
        err = JSON.parse(JSON.stringify(err));
        err[key] = validate.errors;
      }
      if (validate.success) {
        data = JSON.parse(JSON.stringify(data));
        data[key] = validate.data;
      }
      key++;
    }

    if (Object.keys(err).length) {
      sessionStorage.setItem("guestsFormErrors", JSON.stringify(err));
      setHasGuestFormErrors(true);
    }

    setGuestInfo(guestsArr);
    setRooms(selectedRooms);
  }, [strHotelDetails, strSearchState, searchState.guests]);

  function formatDate(date) {
    try {
      return format(new Date(date), "dd MMM yyyy");
    } catch {
      return date;
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    console.log("handleConfirm called - Redirecting to HitPay payment");
    const btn = e.currentTarget;
    btn.disabled = true;

    try {
      console.log("💳 Initiating HitPay payment from Reserve button...");

      // Calculate total price from selected rooms
      const calculateRoomPrice = (room) => {
        if (room?.TotalPrice) return +room.TotalPrice;
        if (room?.totalPrice) return +room.totalPrice;
        if (room?.Price) return +room.Price;
        if (room?.price?.base) {
          const base = +room.price.base;
          const tax = +(room.price?.tax || 0);
          const serviceFee = +(room.price?.serviceFee || 0);
          let discount = 0;
          if (room?.price?.discount?.type === "percentage") {
            discount = base * (+room.price.discount.amount / 100);
          } else if (room?.price?.discount?.amount) {
            discount = +room.price.discount.amount;
          }
          return base + tax + serviceFee - discount;
        }
        return 100; // fallback
      };

      const totalPrice = selectedRooms.length > 0
        ? selectedRooms.reduce((sum, room) => sum + calculateRoomPrice(room), 0)
        : 100;

      // Get primary guest info
      const primaryGuest = guestInfo.length > 0
        ? guestInfo.find(g => g.isPrimary) || guestInfo[0]
        : { firstName: "Guest", lastName: "User", email: "guest@example.com", phone: { dialCode: "+65", number: "12345678" } };

      const paymentPayload = {
        amount: totalPrice,
        email: primaryGuest.email || "guest@example.com",
        name: `${primaryGuest.firstName || "Guest"} ${primaryGuest.lastName || "User"}`,
        phone: `${primaryGuest.phone?.dialCode || "+65"} ${primaryGuest.phone?.number || "12345678"}`,
        purpose: `Hotel Booking - ${hotelDetails.name}`,
        payment_methods: ["card", "paynow_online"],
      };

      console.log("💳 Payment payload:", paymentPayload);

      // Call HitPay API
      const response = await fetch("https://hitpay-backend.vercel.app/api/hitpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      console.log("💳 HitPay response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ HitPay API error:", errorText);
        throw new Error(`Payment API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("💳 Payment API response:", data);

      if (data?.success && data?.payment_url) {
        console.log("✅ Redirecting to HitPay payment page:", data?.payment_url);
        // Redirect to HitPay payment page
        window.location.href = data?.payment_url;
      } else if (data.payment_url) {
        console.log("✅ Redirecting to HitPay payment page:", data?.payment_url);
        window.location.href = data?.payment_url;
      } else {
        throw new Error(data.error || data.message || "Payment URL not received from HitPay");
      }
    } catch (error) {
      console.error("❌ HitPay payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      btn.disabled = false;
    }
  }

  async function handlePayNow(e) {
    e.preventDefault();
    console.log("handlePayNow called");
    const btn = e.currentTarget;
    btn.disabled = true;

    try {
      console.log("💳 Initiating direct HitPay payment...");

      // Calculate total price from selected rooms
      const calculateRoomPrice = (room) => {
        if (room?.TotalPrice) return +room.TotalPrice;
        if (room?.totalPrice) return +room.totalPrice;
        if (room?.Price) return +room.Price;
        if (room?.price?.base) {
          const base = +room.price.base;
          const tax = +(room.price?.tax || 0);
          const serviceFee = +(room.price?.serviceFee || 0);
          let discount = 0;
          if (room?.price?.discount?.type === "percentage") {
            discount = base * (+room.price.discount.amount / 100);
          } else if (room?.price?.discount?.amount) {
            discount = +room.price.discount.amount;
          }
          return base + tax + serviceFee - discount;
        }
        return 100; // fallback
      };

      const totalPrice = selectedRooms.length > 0
        ? selectedRooms.reduce((sum, room) => sum + calculateRoomPrice(room), 0)
        : 100;

      // Get primary guest info
      const primaryGuest = guestInfo.length > 0
        ? guestInfo.find(g => g.isPrimary) || guestInfo[0]
        : { firstName: "Guest", lastName: "User", email: "guest@example.com", phone: { dialCode: "+65", number: "12345678" } };

      const paymentPayload = {
        amount: totalPrice,
        email: primaryGuest.email || "guest@example.com",
        name: `${primaryGuest.firstName || "Guest"} ${primaryGuest.lastName || "User"}`,
        phone: `${primaryGuest.phone?.dialCode || "+65"} ${primaryGuest.phone?.number || "12345678"}`,
        purpose: `Hotel Booking - ${hotelDetails.name}`,
        payment_methods: ["card", "paynow_online"],
      };

      console.log("💳 Payment payload:", paymentPayload);

      // Call HitPay API
      const response = await fetch("https://hitpay-backend.vercel.app/api/hitpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      console.log("💳 HitPay response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ HitPay API error:", errorText);
        throw new Error(`Payment API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("💳 Payment API response:", data);

      if (data?.success && data?.payment_url) {
        console.log("✅ Redirecting to HitPay payment page:", data?.payment_url);
        // Redirect to HitPay payment page
        window.location.href = data?.payment_url;
      } else if (data.payment_url) {
        console.log("✅ Redirecting to HitPay payment page:", data?.payment_url);
        window.location.href = data?.payment_url;
      } else {
        throw new Error(data.error || data.message || "Payment URL not received from HitPay");
      }
    } catch (error) {
      console.error("❌ HitPay payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      btn.disabled = false;
    }
  }

  function setProgress(step) {
    router.push(`${pathname}?tab=${step}`);
  }
  return (
    <div className="space-y-6">
      <Card className="flex items-start gap-4 p-4">
        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded border">
          <Image
            src={hotelDetails.images[0] || "/placeholder.jpg"}
            alt="Hotel preview"
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <CardContent className="space-y-1 p-0">
          <h2 className="text-lg font-semibold">{hotelDetails.name}</h2>

          <p className="text-sm leading-tight text-muted-foreground">
            {hotelDetails.address?.streetAddress}, {hotelDetails.address?.city},{" "}
            {hotelDetails.address?.country}
          </p>

          <p className="text-sm text-muted-foreground">
            {formatDate(searchInfo.checkInDate)} to{" "}
            {formatDate(searchInfo.checkOutDate)} ({searchInfo.nights} night
            {searchInfo.nights > 1 && "s"})
          </p>
        </CardContent>
      </Card>

      {!hasGuestFormErrors ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            <h3 className="mb-2 text-lg font-bold">Guest Information</h3>
            {guestInfo.map((guest, index) => (
              <div key={index} className="space-y-2 pl-2">
                <h4 className="text-md font-semibold">
                  Guest {index + 1} {guest.isPrimary ? "(Primary)" : ""}
                </h4>
                <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted p-3 md:grid-cols-2">
                  <p>
                    <span className="font-medium">Full Name:</span>{" "}
                    {guest.firstName} {guest.lastName}
                  </p>
                  {guest.email && (
                    <p>
                      <span className="font-medium">Email:</span> {guest.email}
                    </p>
                  )}
                  {guest.phone.dialCode && (
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {guest.phone.dialCode} {guest.phone.number}
                    </p>
                  )}
                  <p className="capitalize">
                    <span className="font-medium">Guest Type:</span>{" "}
                    {guest.guestType}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 rounded-md border border-red-300 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Guest Details Incomplete</h2>
          </div>
          <p className="max-w-md text-center text-sm text-red-700">
            Please go back and fix the guest details before proceeding.
          </p>
          <Button
            size="lg"
            onClick={() => setProgress("guest_info")}
            className="bg-red-600 font-semibold text-white hover:bg-red-700"
          >
            Go Back & Fix Details
          </Button>
        </div>
      )}
      {selectedRooms.length > 0 ? (
        <SelectedRoomsCard selectedRooms={selectedRooms} />
      ) : (
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 rounded-md border border-red-300 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-xl font-semibold">No Rooms Selected</h2>
          </div>
          <p className="max-w-md text-center text-sm text-red-700">
            Please select at least one room to proceed.
          </p>
          <Button
            size="lg"
            onClick={() => setProgress("select_room")}
            className="bg-red-600 font-semibold text-white hover:bg-red-700"
          >
            Go Back & Fix Details
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" onClick={handlePayNow} size="lg" className="w-full sm:w-auto">
          Pay Now
        </Button>
      </div>
    </div>
  );
}

function SelectedRoomsCard({ selectedRooms = [] }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-semibold">Selected Rooms</h3>
          <p className="text-sm text-muted-foreground">
            {selectedRooms.length} selected
          </p>
        </div>

        {selectedRooms.map((room, index) => (
          <div
            key={room._id || index}
            className="flex flex-col gap-4 border-b py-4 last:border-none md:flex-row"
          >
            <div className="relative h-24 w-full overflow-hidden rounded-md border md:w-40">
              <Image
                src={room.images?.[0]}
                alt="Room preview"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-1 font-semibold">
              <p className="text-sm">
                {room.roomType} | {room.bedOptions}
              </p>
              <p className="text-xs">Guests Count: {room.sleepsCount}</p>
              <p className="text-xs">Floor: {room.floor}</p>
              <p className="text-xs">Room Number: {room.roomNumber}</p>

              <div className="mt-2 flex flex-wrap gap-1 text-xs font-semibold">
                Features:{" "}
                {room.features?.slice(0, 5).map((feature, i) => (
                  <span
                    key={`feature-${i}`}
                    className="rounded bg-muted px-2 py-0.5 text-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-xs font-semibold">
                Amenities:{" "}
                {room.amenities?.slice(0, 5).map((amenity, i) => (
                  <span
                    key={`amenity-${i}`}
                    className="rounded bg-muted px-2 py-0.5 text-foreground"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
