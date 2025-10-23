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
