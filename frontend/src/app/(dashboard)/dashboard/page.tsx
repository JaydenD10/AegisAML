'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  Users,
  ArrowLeftRight,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Network,
  ActivitySquare,
  AlertTriangle,
  UploadCloud,
  FileSearch,
  Eye,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  Check,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Activity
} from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { useAuth } from '@/lib/auth'

export default function DashboardPage() {
  const { authFetch, user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, watchRes, txRes] = await Promise.all([
        authFetch('/api/dashboard/stats'),
        authFetch('/api/watchlist'),
        authFetch('/api/transactions?limit=8'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      if (watchRes.ok) {
        const watchData = await watchRes.json()
        setWatchlist(watchData.items || [])
      }
      if (txRes.ok) {
        const txData = await txRes.json()
        setRecentTransactions(txData.items || [])
      }
    } catch (e) {
      console.error('Failed to load dashboard telemetry:', e)
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    setStats(null)
    setWatchlist([])
    setRecentTransactions([])
    fetchDashboardData()
  }, [user?.id, user?.email, fetchDashboardData])

  const isDemo = user?.email === 'analyst@aegisaml.corp'
  const hasDataset = stats?.has_dataset ?? (isDemo || (stats?.total_transactions ?? 0) > 0)

  const totalAccounts = stats?.total_accounts ?? (isDemo ? 10000 : 0)
  const totalTransactions = stats?.total_transactions ?? (isDemo ? 1323234 : 0)
  const fraudTransactions = stats?.fraud_transactions ?? (isDemo ? 1719 : 0)
  const activeAlerts = stats?.active_alerts ?? (isDemo ? 1719 : 0)
  const criticalEntities = stats?.critical_entities ?? (isDemo ? 96 : 0)
  const highRiskEntities = stats?.high_risk_entities ?? (isDemo ? 479 : 0)
  const mediumRiskEntities = stats?.medium_risk_entities ?? (isDemo ? 549 : 0)
  const lowRiskEntities = stats?.low_risk_entities ?? (isDemo ? 398531 : 0)

  const totalRiskEntities = criticalEntities + highRiskEntities + mediumRiskEntities + lowRiskEntities
  const critPct = totalRiskEntities > 0 ? ((criticalEntities / totalRiskEntities) * 100).toFixed(2) : '0.00'
  const highPct = totalRiskEntities > 0 ? ((highRiskEntities / totalRiskEntities) * 100).toFixed(2) : '0.00'
  const medPct = totalRiskEntities > 0 ? ((mediumRiskEntities / totalRiskEntities) * 100).toFixed(2) : '0.00'
  const lowPct = totalRiskEntities > 0 ? ((lowRiskEntities / totalRiskEntities) * 100).toFixed(2) : '0.00'

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xl font-black tracking-tight text-slate-900 font-mono hover:opacity-85 hover:scale-[1.02] transition-all cursor-pointer flex items-center group"
              title="Return to Login / Analyst Access"
            >
              <span className="group-hover:text-blue-600 transition-colors">Aegis</span>
              <span className="text-blue-600">AML</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Risk Intelligence & Surveillance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDemo
              ? 'Real-time compliance monitoring across 10,000 accounts and 1.32M transactions.'
              : hasDataset
              ? `Real-time compliance monitoring across ${totalAccounts.toLocaleString()} accounts and ${totalTransactions.toLocaleString()} transactions.`
              : 'No dataset uploaded yet. Ingest a transaction or KYC dataset to begin surveillance.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Status Indicators */}
          {hasDataset ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Model Ensemble: Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Model Ensemble: Standby</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Analyst: {user?.name || 'Compliance Analyst'}</span>
          </div>

          <Link
            href="/upload"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest Data</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Accounts */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Accounts</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
            ) : (
              totalAccounts.toLocaleString()
            )}
          </div>
          <div className="text-[11px] text-slate-500">Monitored Portfolio</div>
        </div>

        {/* Metric 2: Total Transactions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Transactions</span>
            <ArrowLeftRight className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {loading ? (
              <div className="h-8 w-28 bg-slate-100 animate-pulse rounded" />
            ) : (
              totalTransactions.toLocaleString()
            )}
          </div>
          <div className="text-[11px] text-slate-500">Full Dataset Analyzed</div>
        </div>

        {/* Metric 3: Fraud Transactions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fraud / Suspicious</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-600">
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" />
            ) : (
              fraudTransactions.toLocaleString()
            )}
          </div>
          <div className="text-[11px] text-slate-500">Confirmed Fraud Patterns</div>
        </div>

        {/* Metric 4: High-Risk Entities */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">High & Critical Risk</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black font-mono text-orange-600">
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" />
            ) : (
              (criticalEntities + highRiskEntities).toLocaleString()
            )}
          </div>
          <div className="text-[11px] text-slate-500">Composite Score &ge; 0.50</div>
        </div>

        {/* Metric 5: Active Alerts */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-600">
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" />
            ) : (
              activeAlerts.toLocaleString()
            )}
          </div>
          <div className="text-[11px] text-slate-500">Topology & Drift Spikes</div>
        </div>
      </div>

      {/* Main Analytics: Two Columns (Risk Distribution + Priority Watchlist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT (7 cols): Risk Distribution */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Entity Risk Distribution</h3>
                <p className="text-xs text-slate-400">Calculated directly from real ML ensemble predictions</p>
              </div>
            </div>
            <Link
              href="/accounts"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Real Tier Breakdown or Empty State */}
          {!hasDataset ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">No dataset uploaded yet</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Ingest a transaction dataset to calculate model ensemble risk distribution and composite scores.
                </p>
              </div>
              <Link
                href="/upload"
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Ingest Dataset</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Critical Tier */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="font-bold text-slate-800">Critical Risk Band (&ge;75%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {criticalEntities.toLocaleString()} predictions
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                      {critPct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(totalRiskEntities > 0 ? 1 : 0, Math.min(100, parseFloat(critPct)))}%` }}
                  />
                </div>
              </div>

              {/* High Tier */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="font-bold text-slate-800">High Risk Band (50% - 74%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {highRiskEntities.toLocaleString()} predictions
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                      {highPct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(totalRiskEntities > 0 ? 1 : 0, Math.min(100, parseFloat(highPct)))}%` }}
                  />
                </div>
              </div>

              {/* Medium Tier */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-slate-800">Medium Risk Band (25% - 49%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {mediumRiskEntities.toLocaleString()} predictions
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      {medPct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(totalRiskEntities > 0 ? 1 : 0, Math.min(100, parseFloat(medPct)))}%` }}
                  />
                </div>
              </div>

              {/* Low Tier */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800">Low Risk Band (&lt;25%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {lowRiskEntities.toLocaleString()} predictions
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                      {lowPct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(totalRiskEntities > 0 ? 1 : 0, Math.min(100, parseFloat(lowPct)))}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT (5 cols): Priority Watchlist */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-100">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Priority Watchlist</h3>
                <p className="text-xs text-slate-400">High-risk flagged entities from dataset</p>
              </div>
            </div>
            <Link
              href="/watchlist"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[320px] pr-1">
            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : !hasDataset ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Eye className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No dataset uploaded yet</p>
                <p className="text-[11px] text-slate-400">High-risk entities will appear here after ingestion.</p>
              </div>
            ) : watchlist.length > 0 ? (
              watchlist.slice(0, 5).map((item) => (
                <Link
                  key={item.account_id}
                  href={`/accounts/${item.account_id}`}
                  className="block p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200/60 hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-mono text-xs font-black text-slate-900 group-hover:text-blue-600">
                      ACC-{item.account_id}
                    </div>
                    <RiskBadge level={item.risk_band || 'CRITICAL'} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[200px]">{item.reason || 'Threshold Violation'}</span>
                    <span className="font-mono font-bold text-rose-600">
                      {Math.round((item.composite_score || 0.85) * 100)}% Risk
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No high-risk entities currently detected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Behavioral Analytics + Network Intelligence + ML Risk Architecture (3 Grid Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Behavioral Drift & Anomaly Detection */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ActivitySquare className="w-4 h-4 text-cyan-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Behavioral Drift Detectors
              </h3>
            </div>
            <Link href="/drift" className="text-[11px] font-bold text-blue-600 hover:underline">
              Inspect →
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Dynamic change detection tracking velocity and amount shifts over time:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Page-Hinkley (Threshold: 35)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                NORMAL
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">CUSUM Chart (k=0.5, h=4.0)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                NORMAL
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">KS-Test (2-Sample &alpha;=0.05)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                NORMAL
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Z-Score Spike (&gt;2.8&sigma;)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                MONITORING
              </span>
            </div>
          </div>
        </div>

        {/* 2. Transaction Network Intelligence */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Network Intelligence
              </h3>
            </div>
            <Link href="/network" className="text-[11px] font-bold text-blue-600 hover:underline">
              Graph →
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Graph topological metrics and structuring pattern recognition:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">PageRank Centrality</span>
              <span className="font-mono font-bold text-slate-900">&alpha; = 0.85 Iterative</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Fan-In / Fan-Out Alerting</span>
              <span className="font-mono font-bold text-purple-700">
                {hasDataset ? `${activeAlerts.toLocaleString()} Structuring Alerts` : '0 Alerts'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Topological Subgraph</span>
              <span className="font-mono font-bold text-slate-900">Bounded 2-Hop Query</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Network Clustering</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* 3. ML Risk Assessment & Ensemble Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                ML Model Ensemble
              </h3>
            </div>
            <Link href="/explainability" className="text-[11px] font-bold text-blue-600 hover:underline">
              SHAP →
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Trained ensemble weights and composite scoring formula:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Random Forest Classifier</span>
              <span className="font-mono font-bold text-slate-900">40% Weight (depth=8)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Gradient Boosting Classifier</span>
              <span className="font-mono font-bold text-slate-900">35% Weight (depth=5)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">XGBoost Classifier</span>
              <span className="font-mono font-bold text-slate-900">25% Weight (scale_pos)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100">
              <span className="font-bold text-blue-900">Composite Formula</span>
              <span className="font-mono text-[11px] font-bold text-blue-700">0.70 &times; ML + 0.30 &times; Drift</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Surveillance Feed Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Surveillance Ledger Feed</h3>
            <p className="text-xs text-slate-400">Recent audited transactions with real fraud probability & risk bands</p>
          </div>
          <Link
            href="/transactions"
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Open Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="aml-table w-full">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider bg-slate-50/40">
                <th className="py-3 px-4 text-left">Transaction ID</th>
                <th className="py-3 px-4 text-left">Sender</th>
                <th className="py-3 px-4 text-left">Receiver</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Risk Band</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-right">Explainability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <tr key={tx.tx_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/transactions/${tx.tx_id}`}
                        className="font-mono font-bold text-blue-600 hover:underline"
                      >
                        TX-{tx.tx_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <Link href={`/accounts/${tx.sender_account_id}`} className="hover:text-blue-600 hover:underline">
                        ACC-{tx.sender_account_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <Link href={`/accounts/${tx.receiver_account_id}`} className="hover:text-blue-600 hover:underline">
                        ACC-{tx.receiver_account_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {tx.tx_type || 'TRANSFER'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${Number(tx.tx_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RiskBadge level={tx.risk_band || (tx.is_fraud ? 'CRITICAL' : 'LOW')} />
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">
                      {tx.composite_score != null ? `${(tx.composite_score * 100).toFixed(0)}%` : '–'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/explainability/${tx.tx_id}`}
                        className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                        <span>SHAP &rarr;</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ArrowLeftRight className="w-6 h-6 text-slate-300" />
                      <p className="font-bold text-slate-700">
                        {hasDataset ? 'No transactions recorded.' : 'No dataset uploaded yet.'}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        {hasDataset
                          ? 'No transactions found matching the filter.'
                          : 'Upload a CSV dataset to populate the real-time surveillance ledger.'}
                      </p>
                      {!hasDataset && (
                        <Link
                          href="/upload"
                          className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Ingest Data</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
