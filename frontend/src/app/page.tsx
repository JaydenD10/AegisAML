'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ActivitySquare,
  Network,
  Eye,
  Lock,
  Mail,
  User,
  Loader2,
  Zap
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function HomePage() {
  const router = useRouter()
  const { login, signup } = useAuth()

  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Individual Element Refs ONLY (No parent/container transforms)
  const shieldRef = useRef<HTMLDivElement>(null)
  const cardTLRef = useRef<HTMLDivElement>(null)
  const cardTRRef = useRef<HTMLDivElement>(null)
  const cardBLRef = useRef<HTMLDivElement>(null)
  const cardBRRef = useRef<HTMLDivElement>(null)
  const orbitsRef = useRef<HTMLDivElement>(null)
  const particle1Ref = useRef<HTMLDivElement>(null)
  const particle2Ref = useRef<HTMLDivElement>(null)

  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseCurrent = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Disable on touch / mobile devices
    const isTouchDevice =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0)

    if (isTouchDevice) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize cursor position between -1.0 and 1.0
      const x = ((e.clientX / window.innerWidth) - 0.5) * 2
      const y = ((e.clientY / window.innerHeight) - 0.5) * 2
      mouseTarget.current.x = Math.max(-1, Math.min(1, x))
      mouseTarget.current.y = Math.max(-1, Math.min(1, y))
    }

    const handleMouseLeave = () => {
      // Smoothly return to center
      mouseTarget.current.x = 0
      mouseTarget.current.y = 0
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    let animationFrameId: number

    const renderLoop = () => {
      // Smooth interpolation with gentle inertia (ease = 0.06)
      const ease = 0.06
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * ease
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * ease

      const cx = mouseCurrent.current.x
      const cy = mouseCurrent.current.y

      // STRICT SMALL MOVEMENT LIMITS (max ±2px to ±8px) APPLIED ONLY TO INDIVIDUAL ELEMENTS:

      // 1. Central Aegis AML Shield Card (Max ~7.5px)
      if (shieldRef.current) {
        shieldRef.current.style.transform = `translate3d(${cx * 7.5}px, ${cy * 7.5}px, 0)`
      }

      // 2. LIVE SURVEILLANCE floating card (Max ~5px)
      if (cardTLRef.current) {
        cardTLRef.current.style.transform = `translate3d(${cx * 5}px, ${cy * 5}px, 0)`
      }

      // 3. SHAP FORENSICS floating card (Max ~5px)
      if (cardTRRef.current) {
        cardTRRef.current.style.transform = `translate3d(${-cx * 4.5}px, ${cy * 5}px, 0)`
      }

      // 4. TOPOLOGY GRAPH floating card (Max ~5px)
      if (cardBLRef.current) {
        cardBLRef.current.style.transform = `translate3d(${cx * 5}px, ${-cy * 4.5}px, 0)`
      }

      // 5. BEHAVIORAL DRIFT floating card (Max ~5px)
      if (cardBRRef.current) {
        cardBRRef.current.style.transform = `translate3d(${-cx * 4.5}px, ${-cy * 4.5}px, 0)`
      }

      // 6. Connecting / Orbit lines (Max ~3px)
      if (orbitsRef.current) {
        orbitsRef.current.style.transform = `translate3d(${cx * 3}px, ${cy * 3}px, 0)`
      }

      // 7. Small decorative particles (Max ~3.5px)
      if (particle1Ref.current) {
        particle1Ref.current.style.transform = `translate3d(${cx * 3.5}px, ${cy * 3.5}px, 0)`
      }
      if (particle2Ref.current) {
        particle2Ref.current.style.transform = `translate3d(${-cx * 3}px, ${-cy * 3}px, 0)`
      }

      animationFrameId = requestAnimationFrame(renderLoop)
    }

    animationFrameId = requestAnimationFrame(renderLoop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (!fullName || !email || !password) {
          setError('Please fill in all required fields.')
          setLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        const res = await signup(fullName, email, password, confirmPassword)
        if (res && !res.success) {
          setError(res.error || 'Workspace registration failed.')
          setLoading(false)
          return
        }
      } else {
        if (!email || !password) {
          setError('Please enter your email and password.')
          setLoading(false)
          return
        }
        const res = await login(email, password)
        if (res && !res.success) {
          setError(res.error || 'Authentication failed.')
          setLoading(false)
          return
        }
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Operation failed.')
      setLoading(false)
    }
  }

  const handleDemoAccess = async () => {
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
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 md:py-12 selection:bg-blue-500/20 selection:text-blue-900">
      
      {/* 100% STATIC Ambient background - NEVER moves */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-200/20 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-purple-300/25 to-pink-200/20 blur-[120px]" />
        <div className="absolute top-[40%] right-[35%] w-[350px] h-[350px] rounded-full bg-cyan-200/25 blur-[90px]" />
      </div>

      {/* 100% STATIC Main Responsive Grid Layout */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        
        {/* ================= LEFT COLUMN: HERO HEADLINE (100% STATIC) ================= */}
        <div className="lg:col-span-4 space-y-5 text-left z-10">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Create Your AML Intelligence Workspace
            </h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
              Every analyst receives an isolated cryptographic partition with private dataset ingestion, custom risk threshold tuning, and audit trail provenance.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDemoAccess}
              disabled={loading}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/80 hover:bg-white border border-white/90 text-blue-700 text-xs font-bold shadow-[0_8px_20px_rgba(37,99,235,0.08)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.15)] transition-all cursor-pointer group"
            >
              <Zap className="w-4 h-4 text-blue-600 fill-blue-600 group-hover:scale-110 transition-transform" />
              <span>Launch Demo Environment (10K Accounts, 1.32M Txs)</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ================= CENTER COLUMN: STATIC CONTAINER WITH INDIVIDUALLY PARALLAXED ELEMENTS ================= */}
        <div className="lg:col-span-4 flex items-center justify-center relative min-h-[460px] select-none py-6 overflow-visible">
          
          {/* 1. Orbit Geometry & Connecting Lines Layer (Subtle ±3px Parallax) */}
          <div
            ref={orbitsRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
          >
            {/* Outer Orbit Ring */}
            <div className="w-[410px] h-[410px] rounded-full border border-blue-300/35 border-dashed animate-orbit-slow relative">
              {/* Cyan Pulse Particle (±3.5px) */}
              <div
                ref={particle1Ref}
                className="absolute top-10 right-12 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] will-change-transform"
              />
            </div>

            {/* Inner Orbit Ring */}
            <div className="w-[300px] h-[300px] rounded-full border border-indigo-200/40 relative animate-orbit-reverse">
              {/* Purple Pulse Particle (±3px) */}
              <div
                ref={particle2Ref}
                className="absolute bottom-6 left-10 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] will-change-transform"
              />
            </div>

            {/* Subtle connecting lines from center to corners */}
            <svg className="absolute w-[440px] h-[440px] opacity-40" viewBox="0 0 440 440">
              <line x1="220" y1="220" x2="80" y2="70" stroke="#93C5FD" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="220" y1="220" x2="360" y2="90" stroke="#C4B5FD" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="220" y1="220" x2="90" y2="360" stroke="#A5B4FC" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1="220" y1="220" x2="350" y2="350" stroke="#67E8F9" strokeWidth="1.2" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* 2. TOP-LEFT FLOATING BADGE: LIVE SURVEILLANCE (±5px Parallax) */}
          <div
            ref={cardTLRef}
            className="absolute -top-2 left-0 sm:-left-4 z-20 will-change-transform"
          >
            <div className="animate-float-tl">
              <div className="liquid-glass-badge px-4 py-3 min-w-[175px] space-y-1">
                <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span className="tracking-wide">LIVE SURVEILLANCE</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
                  <span>ACTIVE VIGILANCE</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. TOP-RIGHT FLOATING BADGE: SHAP FORENSICS (±5px Parallax) */}
          <div
            ref={cardTRRef}
            className="absolute top-2 -right-2 sm:-right-6 z-20 will-change-transform"
          >
            <div className="animate-float-tr">
              <div className="liquid-glass-badge px-4 py-3 min-w-[175px] space-y-1">
                <div className="flex items-center gap-2 text-purple-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span className="tracking-wide">SHAP FORENSICS</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)] animate-pulse" />
                  <span>INTERPRETABLE AI</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. CENTRAL FOCAL POINT: AEGIS AML SHIELD CARD ONLY (±7.5px Parallax) */}
          <div
            ref={shieldRef}
            className="relative z-30 flex flex-col items-center will-change-transform"
          >
            <div className="liquid-glass-panel p-8 sm:p-9 flex flex-col items-center justify-center space-y-4 shadow-[0_25px_60px_-10px_rgba(37,99,235,0.18)] animate-shield-glow min-w-[200px] sm:min-w-[220px]">
              {/* Glowing Shield Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-[0_12px_30px_rgba(37,99,235,0.45)] relative group">
                <ShieldCheck className="w-9 h-9 text-white stroke-[2.2]" />
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Logo Title */}
              <div className="text-center">
                <div className="text-xl font-black tracking-tight text-slate-900 font-mono flex items-center justify-center gap-1">
                  <span>Aegis</span>
                  <span className="text-blue-600">AML</span>
                </div>
              </div>

              {/* Surveillance Active Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.9)] animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                  SURVEILLANCE ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* 5. BOTTOM-LEFT FLOATING BADGE: TOPOLOGY GRAPH (±5px Parallax) */}
          <div
            ref={cardBLRef}
            className="absolute bottom-2 -left-2 sm:-left-6 z-20 will-change-transform"
          >
            <div className="animate-float-bl">
              <div className="liquid-glass-badge px-4 py-3 min-w-[175px] space-y-1">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
                  <Network className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="tracking-wide">TOPOLOGY GRAPH</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)] animate-pulse" />
                  <span>2-HOP CLUSTER MATRIX</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. BOTTOM-RIGHT FLOATING BADGE: BEHAVIORAL DRIFT (±5px Parallax) */}
          <div
            ref={cardBRRef}
            className="absolute -bottom-2 right-0 sm:-right-4 z-20 will-change-transform"
          >
            <div className="animate-float-br">
              <div className="liquid-glass-badge px-4 py-3 min-w-[185px] space-y-1">
                <div className="flex items-center gap-2 text-cyan-800 text-xs font-bold">
                  <ActivitySquare className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="tracking-wide">BEHAVIORAL DRIFT</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-cyan-600 tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse" />
                  <span>MULTI-DETECTOR MONITOR</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: ANALYST WORKSPACE REGISTER / LOGIN PANEL (100% STATIC) ================= */}
        <div className="lg:col-span-4 w-full flex justify-center lg:justify-end z-20">
          <div className="liquid-glass-panel p-7 sm:p-8 w-full max-w-[420px] shadow-[0_25px_60px_rgba(15,23,42,0.08)] space-y-6">
            
            {/* Panel Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-[0_8px_20px_rgba(37,99,235,0.35)]">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-black text-slate-900 tracking-tight font-mono">
                Aegis<span className="text-blue-600">AML</span>
              </div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                {mode === 'register' ? 'REGISTER ANALYST WORKSPACE' : 'ANALYST WORKSPACE SIGN IN'}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold leading-snug">
                {error}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    ANALYST FULL NAME
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alice Vance"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/90 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

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

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 border border-slate-200/90 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_8px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'register' ? 'CREATE & OPEN PARTITION' : 'SIGN IN TO WORKSPACE'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setMode(mode === 'register' ? 'login' : 'register')
                }}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {mode === 'register' ? (
                  <>
                    Already have an active partition? <span className="text-blue-600 font-bold hover:underline">Sign In</span>
                  </>
                ) : (
                  <>
                    Need an analyst partition? <span className="text-blue-600 font-bold hover:underline">Register Workspace</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
