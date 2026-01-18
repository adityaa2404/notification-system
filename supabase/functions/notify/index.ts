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



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODQwMTQzNDl9.RoQODZEJFpJEW9bq0hm8e339iT43CVA61y-LNWGsXvBfODL6eucvEnSd4gnT1yg_pga0g9eYwbnoae9rfNmv7g' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
