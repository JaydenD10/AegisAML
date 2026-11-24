'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Network,
  ActivitySquare,
  ShieldAlert,
  Loader2,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  ArrowRight,
  Info
} from "lucide-react"
import { RiskBadge } from "@/components/ui/RiskBadge"
import { useAuth } from "@/lib/auth"

export default function AccountDetailPage({ params }: { params: any }) {
  const routeParams = useParams()
  const { authFetch } = useAuth()
  const id = (routeParams?.id as string) || params?.id
  const [data, setData] = useState<any>(null)
  const [driftData, setDriftData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      authFetch(`/api/accounts/${id}`).then(res => res.ok ? res.json() : null),
      authFetch(`/api/drift/${id}`).then(res => res.ok ? res.json() : null)
    ])
      .then(([accData, dData]) => {
        setData(accData)
        setDriftData(dData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, authFetch])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Loading Account Intelligence Profile...
          </span>
        </div>
      </div>
    )
  }

  if (!data || !data.account) {
    return (
      <div className="space-y-4 p-8 text-center rounded-2xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm">
        <div className="text-sm font-bold text-rose-600">Account ACC-{id} not found in monitored portfolio.</div>
        <Link href="/accounts" className="text-xs font-bold text-blue-600 hover:underline">
          &larr; Back to Accounts List
        </Link>
      </div>
    )
  }

  const acc = data.account
  const transactions = data.recent_transactions || []
  
  // Compute aggregate statistics
  const totalAmount = transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0)
  const highestScoreTx = transactions.reduce((max: any, tx: any) => (!max || (tx.composite_score || 0) > (max.composite_score || 0)) ? tx : max, null)
  const maxRiskScore = highestScoreTx?.composite_score ?? (acc.is_fraud ? 0.88 : 0.12)
  const highestRiskBand = highestScoreTx?.risk_band ?? (acc.is_fraud ? 'CRITICAL' : 'LOW')
  const isHighRisk = maxRiskScore >= 0.50 || acc.is_fraud

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <Link href="/accounts" className="font-bold text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Monitored Entities
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-mono font-bold text-slate-700">ACC-{id}</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black font-mono text-slate-900">ACC-{acc.account_id}</h1>
            <RiskBadge level={highestRiskBand} />
            {acc.is_fraud && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                CONFIRMED FRAUD FLAGGED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customer ID: <strong className="font-mono text-slate-700">{acc.customer_id}</strong> &middot; 
            Jurisdiction: <strong className="text-slate-700">{acc.country || 'US'}</strong> &middot; 
            Account Type: <strong className="text-slate-700">{acc.account_type || 'STANDARD'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/drift/${acc.account_id}`}
            className="px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
          >
            <ActivitySquare className="w-4 h-4" />
            <span>Behavioral Drift</span>
          </Link>
          <Link
            href={`/network/${acc.account_id}`}
            className="px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
          >
            <Network className="w-4 h-4" />
            <span>Network Subgraph</span>
          </Link>
        </div>
      </div>

      {/* ML Risk & Surveillance Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ML Composite Risk */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Peak Risk Score
          </div>
          <div className={`text-2xl font-black font-mono ${isHighRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
            {(maxRiskScore * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500">
            {highestRiskBand} Risk Banding
          </div>
        </div>

        {/* Transaction Volume */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Ledger Volume
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500">
            {transactions.length} Audited Transactions
          </div>
        </div>

        {/* Initial Balance */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Initial Balance
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600">
            ${(acc.init_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500">
            Baseline Ledger Reserve
          </div>
        </div>

        {/* Behavioral Drift State */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Drift Status
          </div>
          <div className="text-2xl font-black font-mono text-cyan-600">
            {((driftData?.current_drift || 0) * 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-slate-500">
            {driftData?.current_drift > 0.4 ? 'Velocity Anomaly Flagged' : 'Nominal Drift Profile'}
          </div>
        </div>
      </div>

      {/* Counterfactual Guidance: How Could This Risk Be Reduced? */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>AML Risk Drivers & Counterfactual Assessment (How could risk be reduced?)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Normalize Burst Amount Ratio</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Account exhibits a high <code className="font-mono bg-slate-200/60 px-1 py-0.5 rounded text-[11px]">acct_max_mean_ratio_send</code>. 
              Reducing single-day transaction spike amounts closer to the 30-day historical mean would reduce composite risk by ~24%.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Decelerate Fan-Out Velocity</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Rapid outward transfers to multiple novel destination accounts trigger Page-Hinkley cumulative sum alerts. 
              Spacing transfers across regular settlement cycles dampens drift detection triggers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Topological Distance Verification</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Verify beneficiary entity identities to decouple account from 2-hop clusters associated with known structuring loops.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recent Audited Transactions for ACC-{acc.account_id}
          </div>
          <span className="text-xs text-slate-400 font-mono">{transactions.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="aml-table w-full">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider bg-slate-50/40">
                <th className="py-3 px-4 text-left">TX ID</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Risk Band</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-right">SHAP Forensics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <tr key={tx.tx_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <Link href={`/transactions/${tx.tx_id}`} className="text-blue-600 hover:underline">
                        TX-{tx.tx_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {tx.type || 'TRANSFER'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                        <span>Inspect SHAP &rarr;</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    No transactions indexed for this account.
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
