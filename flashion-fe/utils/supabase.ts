import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://jujcddthoswitdaosbtt.supabase.co'
const supabasePublishableKey = 'sb_publishable_A9Ojzk4-7PTlqtVOCUcYog_ZsI9aTKv'

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      ...(Platform.OS !== 'web' && {
        storage: AsyncStorage,
      }),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
