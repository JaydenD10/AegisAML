'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Zap,
  Eye,
  Sparkles,
  ActivitySquare,
  Network
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await login(email, password)
      if (res && !res.success) {
        setError(res.error || 'Invalid credentials or connection error.')
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or connection error.')
      setLoading(false)
    }
  }

  const handleQuickDemoAccess = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await login('analyst@aegisaml.corp', 'password123')
      if (res && !res.success) {
        setError(res.error || 'Demo analyst login failed.')
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Demo analyst login failed.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 selection:bg-blue-500/20 selection:text-blue-900 relative">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[15%] left-[20%] w-[400px] h-[400px] rounded-full bg-blue-200/25 blur-[90px]" />
        <div className="absolute bottom-[15%] right-[20%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Platform Highlights */}
        <div className="lg:col-span-6 space-y-6 hidden lg:block pr-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 font-mono">
                Aegis<span className="text-blue-600">AML</span>
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Risk Intelligence Platform
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Enterprise Anti-Money Laundering Surveillance
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Auditing 10,000 monitored entities and 1.32M transactions using multi-detector behavioral drift, 
              graph topological clustering, and TreeExplainer SHAP feature forensics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="liquid-glass-badge p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-700 text-[11px] font-bold">
                <Eye className="w-3.5 h-3.5" />
                <span>SURVEILLANCE</span>
              </div>
              <div className="text-[10px] text-slate-500">Continuous 24/7 transaction monitor</div>
            </div>
            <div className="liquid-glass-badge p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-700 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SHAP FORENSICS</span>
              </div>
              <div className="text-[10px] text-slate-500">TreeExplainer risk attribution</div>
            </div>
            <div className="liquid-glass-badge p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-700 text-[11px] font-bold">
                <Network className="w-3.5 h-3.5" />
                <span>TOPOLOGY</span>
              </div>
              <div className="text-[10px] text-slate-500">2-hop subgraph cluster analysis</div>
            </div>
            <div className="liquid-glass-badge p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-800 text-[11px] font-bold">
                <ActivitySquare className="w-3.5 h-3.5" />
                <span>DRIFT MONITOR</span>
              </div>
              <div className="text-[10px] text-slate-500">Multi-detector behavioral shift</div>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="liquid-glass-panel p-8 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-[0_8px_20px_rgba(37,99,235,0.35)]">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight font-mono">
                Aegis<span className="text-blue-600">AML</span>
              </h1>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                ANALYST WORKSPACE SIGN IN
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  ANALYST EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@aegisaml.corp"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/90 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/90 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_8px_25px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>SIGN IN TO WORKSPACE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white/90 px-2 rounded">OR INSTANT ACCESS</span>
              </div>
            </div>

            <button
              onClick={handleQuickDemoAccess}
              disabled={loading}
              type="button"
              className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 text-blue-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span>Access as Demo Analyst (10K Accounts)</span>
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                Need an isolated partition? <span className="text-blue-600 font-bold hover:underline">Register Workspace</span>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
