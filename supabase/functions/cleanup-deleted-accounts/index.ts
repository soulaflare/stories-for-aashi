import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting cleanup of accounts scheduled for deletion");

    // Find accounts that were scheduled for deletion more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: accountsToDelete, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, email, deletion_requested_at')
      .eq('scheduled_for_deletion', true)
      .lt('deletion_requested_at', thirtyDaysAgo.toISOString());

    if (fetchError) {
      console.error("Error fetching accounts to delete:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch accounts for deletion" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!accountsToDelete || accountsToDelete.length === 0) {
      console.log("No accounts found for deletion");
      return new Response(
        JSON.stringify({ message: "No accounts to delete", deleted_count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${accountsToDelete.length} accounts to delete`);

    let deletedCount = 0;
    const errors: string[] = [];

    // Delete each account
    for (const account of accountsToDelete) {
      try {
        console.log(`Deleting account for user: ${account.user_id}`);

        // Delete the user profile (this will cascade to other tables due to foreign keys)
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', account.user_id);

        if (profileError) {
          console.error(`Error deleting profile for user ${account.user_id}:`, profileError);
          errors.push(`Failed to delete profile for user ${account.user_id}: ${profileError.message}`);
          continue;
        }

        // Delete the auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(account.user_id);

        if (authError) {
          console.error(`Error deleting auth user ${account.user_id}:`, authError);
          errors.push(`Failed to delete auth user ${account.user_id}: ${authError.message}`);
          continue;
        }

        console.log(`Successfully deleted account for user: ${account.user_id}`);
        deletedCount++;

      } catch (error) {
        console.error(`Unexpected error deleting account ${account.user_id}:`, error);
        errors.push(`Unexpected error deleting account ${account.user_id}: ${error.message}`);
      }
    }

    const result = {
      message: `Account cleanup completed`,
      total_found: accountsToDelete.length,
      deleted_count: deletedCount,
      errors: errors
    };

    console.log("Cleanup results:", result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error in cleanup-deleted-accounts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);