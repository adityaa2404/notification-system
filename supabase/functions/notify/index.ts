// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })


import { serve } from "https://deno.land/std/http/server.ts";
import { sendEmail } from "./channels/email.ts";
import { sendPush } from "./channels/push.ts";
//console.log("ENV CHECK:", Deno.env.get("RESEND_API_KEY"));
serve(async (req) => {
  try {
    const { channel, data } = await req.json();

    if (!channel || !data) {
      return new Response(
        JSON.stringify({ error: "channel and data are required" }),
        { status: 400 }
      );
    }

    switch (channel) {
      case "EMAIL":
        await sendEmail(data);
        break;

      case "PUSH":
        await sendPush(data);
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Unsupported channel" }),
          { status: 400 }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification sent via ${channel}`,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});


