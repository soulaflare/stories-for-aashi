import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VideoNotificationData {
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  upload_date: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { video }: { video: VideoNotificationData } = await req.json();
    
    console.log('Processing notification for video:', video.title);

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users who want email notifications
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('email_notifications', true)
      .not('email', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No users subscribed to notifications');
      return new Response(JSON.stringify({ message: 'No subscribers' }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending notifications to ${profiles.length} users`);

    // Create email template
    const createEmailHTML = (displayName: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Story Available!</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #0f0f23;
              color: #e2e8f0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .content {
              background: #1a1a3a;
              border-radius: 12px;
              padding: 24px;
              border: 1px solid #2a2a5a;
            }
            .video-thumbnail {
              width: 100%;
              border-radius: 8px;
              margin-bottom: 16px;
            }
            .video-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 12px;
              color: #f8fafc;
            }
            .video-description {
              color: #cbd5e1;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              text-align: center;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #64748b;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📚 Bedtime Stories</div>
            </div>
            
            <div class="content">
              <img src="${video.thumbnail_url}" alt="${video.title}" class="video-thumbnail" />
              
              <h2 class="video-title">${video.title}</h2>
              
              <p class="video-description">
                ${video.description.substring(0, 200)}${video.description.length > 200 ? '...' : ''}
              </p>
              
              <a href="${video.video_url}" class="cta-button">Watch Now ✨</a>
            </div>
            
            <div class="footer">
              <p>You're receiving this because you subscribed to new story notifications.</p>
              <p>Visit your profile to manage your notification preferences.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails to all subscribers
    const emailPromises = profiles.map(async (profile) => {
      const displayName = profile.display_name || profile.email.split('@')[0];
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Bedtime Stories <stories@resend.dev>",
          to: [profile.email],
          subject: `✨ New Story: ${video.title}`,
          html: createEmailHTML(displayName),
        });
        
        console.log(`Email sent to ${profile.email}:`, emailResponse.id);
        return { success: true, email: profile.email };
      } catch (error) {
        console.error(`Failed to send email to ${profile.email}:`, error);
        return { success: false, email: profile.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    // Record the notification in the database
    await supabase
      .from('story_notifications')
      .insert({
        video_id: video.video_id,
        video_title: video.title,
        recipient_count: successCount,
      });

    console.log(`Notification sent to ${successCount}/${profiles.length} users`);

    return new Response(JSON.stringify({ 
      message: `Notification sent successfully`,
      recipients: successCount,
      total: profiles.length 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in send-new-video-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);