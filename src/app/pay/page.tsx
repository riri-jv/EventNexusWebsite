// app/pay/page.tsx
"use client";

import { useState } from "react";
import Script from "next/script";
import { useUser } from "@clerk/nextjs";



export default function Pay() {
  const [amount, setAmount] = useState<number>(0);
  const { user } = useUser();
  const phoneNumber = user?.phoneNumbers[0]?.phoneNumber; // E.164 format


  const createOrder = async () => {
    const res = await fetch('/api/createOrder', {
    method: "POST",
    body: JSON.stringify({amount: amount*100}),
    });

    const data = await res.json();

    const paymentData = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: data.id, 

      prefill: {
        contact: phoneNumber || "", // Clerk phone number
        name: user?.fullName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async function (response: any){
        //verify the payment
        const res = await fetch('/api/verifyOrder', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        const data = await res.json();
        console.log(data);


        //check if the payment was successful
        if (data.isOk) {
          //do whatever page transaction you want here as payment was successful
          alert("Payment successful");
        } else {
          alert("Payment failed");
        }
        // probably some db calls here to update the order status or add premium status to user


      }

    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payment = new (window as any).Razorpay(paymentData);
    payment.open();
  };

  return (
    <div className="flex w-screen h-screen items-center justify-center flex-col gap-4">

      <Script type="text/javascript" src="https://checkout.razorpay.com/v1/checkout.js" />


      <input
        type="number"
        placeholder="Enter amount"
        className="px-4 py-2 rounded-md text-black"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button 
        className="bg-green-500 text-white px-4 py-2 rounded-md" 
        onClick={createOrder}>
        Create Order
      </button>
    </div>
  );
}
