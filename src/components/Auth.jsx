import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from './Toast'
import { Icon } from './Icon'

export const Auth = ({ onSessionChange }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleAuth = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('Please fill in all fields', 'error')
      return
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }

    setLoading(true)

    try {
      if (supabase) {
        // Real Supabase Auth
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({ email, password })
          if (error) throw error
          showToast('Registration successful! Please check your email.', 'success')
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          showToast('Successfully signed in!', 'success')
          onSessionChange()
        }
      } else {
        // Mock LocalStorage Auth Fallback
        if (isSignUp) {
          const users = JSON.parse(localStorage.getItem('ko_mock_users') || '[]')
          if (users.find((u) => u.email === email)) {
            throw new Error('User already exists')
          }
          users.push({ email, password })
          localStorage.setItem('ko_mock_users', JSON.stringify(users))
          showToast('Mock registration successful! You can now log in.', 'success')
          setIsSignUp(false)
        } else {
          const users = JSON.parse(localStorage.getItem('ko_mock_users') || '[]')
          // Add a default user to mock db if empty
          if (users.length === 0) {
            users.push({ email: 'admin@kickoff.com', password: 'password' })
            localStorage.setItem('ko_mock_users', JSON.stringify(users))
          }
          const user = users.find((u) => u.email === email && u.password === password)
          if (!user && !(email === 'admin@kickoff.com' && password === 'password')) {
            throw new Error('Invalid email or password')
          }
          localStorage.setItem('ko_mock_session', JSON.stringify({ email, token: 'mock-session-token' }))
          showToast('Successfully signed in (offline mode)!', 'success')
          onSessionChange()
        }
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="font-display-lg text-display-lg text-primary font-extrabold tracking-tight">
          Project Kickoff
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant font-label-md">
          IT Consultancy Suite
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-base py-8 px-4 border border-border-subtle rounded-xl shadow-sm sm:px-10">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 text-center">
            {isSignUp ? 'Create your Account' : 'Sign In'}
          </h2>

          <form className="space-y-6" onSubmit={handleAuth}>
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@kickoff.com"
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md placeholder:text-outline-variant"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md placeholder:text-outline-variant"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-label-md font-label-md font-semibold text-white bg-primary hover:opacity-90 active:scale-95 duration-100 transition-all focus:outline-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="progress_activity" size={18} className="animate-spin" />
                  Please wait...
                </span>
              ) : isSignUp ? (
                'Sign Up'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-body-md text-primary font-semibold hover:underline bg-transparent border-0"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
          
          {!supabase && (
            <div className="mt-6 p-3 bg-primary-fixed/30 rounded-lg text-center flex items-center gap-2 justify-center border border-primary-fixed-dim/20 text-on-primary-fixed">
              <Icon name="wifi_off" size={18} />
              <span className="text-[11px] font-medium">Offline Fallback: admin@kickoff.com / password</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
