import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth credentials')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Parse the request body to get the user ID
    const { user_id } = await req.json();
    console.log('Received request for user:', user_id);

    if (!user_id) {
      console.error('No user ID provided');
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Use the exact redirect URI that's configured in Google Cloud Console
    const redirectUri = 'https://yrrnprfymzagkxcwycrk.supabase.co/functions/v1/google-calendar-callback'
    
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID)
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri)
    googleAuthUrl.searchParams.append('response_type', 'code')
    googleAuthUrl.searchParams.append('scope', [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ].join(' '))
    googleAuthUrl.searchParams.append('access_type', 'offline')
    googleAuthUrl.searchParams.append('state', user_id)
    googleAuthUrl.searchParams.append('prompt', 'consent')

    console.log('Generated auth URL:', googleAuthUrl.toString())

    return new Response(
      JSON.stringify({ url: googleAuthUrl.toString() }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in authorization process:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate authorization URL' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})