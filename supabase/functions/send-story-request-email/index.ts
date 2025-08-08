import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StoryRequestEmailData {
  storyTitle: string;
  userName?: string;
  userEmail?: string;
  additionalNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyTitle, userName, userEmail, additionalNotes }: StoryRequestEmailData = await req.json();

    console.log("Processing story request:", { storyTitle, userName, userEmail });

    const emailResponse = await resend.emails.send({
      from: "Stories for Aashi <onboarding@resend.dev>",
      to: ["aditya1992@hotmail.com"],
      subject: `New Story Request: ${storyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
            📚 New Story Request
          </h1>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #4F46E5; margin-top: 0;">Requested Story:</h2>
            <p style="font-size: 18px; font-weight: bold; color: #333; margin: 10px 0;">
              "${storyTitle}"
            </p>
          </div>

          ${userName || userEmail ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #64748b; margin-top: 0;">Requester Information:</h3>
            ${userName ? `<p><strong>Name:</strong> ${userName}</p>` : ''}
            ${userEmail ? `<p><strong>Email:</strong> ${userEmail}</p>` : ''}
          </div>
          ` : `
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;">
              <strong>Anonymous Request:</strong> No user information provided
            </p>
          </div>
          `}

          ${additionalNotes ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #64748b; margin-top: 0;">Additional Notes:</h3>
            <p style="color: #374151; line-height: 1.6;">${additionalNotes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>This request was submitted through the Stories for Aashi website.</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-story-request-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);