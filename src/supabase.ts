import { createClient } from '@supabase/supabase-js'
import { getTokenSilently } from './auth0'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    accessToken: async () => {
        const accessToken = await getTokenSilently()
        return accessToken
    }
})

// Function to set auth token for realtime
export const setRealtimeAuth = async () => {
    try {
        const token = await getTokenSilently()
        supabase.realtime.setAuth(token)
        console.log('Realtime auth token set successfully')
    } catch (error) {
        console.error('Failed to set realtime auth token:', error)
    }
}

// Export function to refresh realtime auth when token is refreshed
export const refreshRealtimeAuth = setRealtimeAuth
