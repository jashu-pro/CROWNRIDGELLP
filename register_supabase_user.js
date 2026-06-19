import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hdzpymhggoqxrrfwzmwz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkenB5bWhnZ29xeHJyZnd6bXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3Nzk1MzgsImV4cCI6MjA5NzM1NTUzOH0.ntThTaFhXxULda8NwLq9oYifIszTcP5j3luAB-LLXgs'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function register() {
  console.log('Attempting to register user jaswanthmajji43@gmail.com in your Supabase Auth backend...')

  const { data, error } = await supabase.auth.signUp({
    email: 'jaswanthmajji43@gmail.com',
    password: 'jaswanth'
  })

  if (error) {
    console.error('Registration failed:', error.message)
  } else {
    console.log('Registration call completed successfully!')
    console.log('User Details:', data.user)
    if (data.session) {
      console.log('Session initialized immediately.')
    } else {
      console.log('Note: If email confirmation is enabled in your Supabase dashboard, please check your email (jaswanthmajji43@gmail.com) to confirm and activate the account before logging in.')
    }
  }
}

register()
