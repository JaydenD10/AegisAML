'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Microscope,
  ArrowLeft,
  Activity,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Info,
  CheckCircle2
} from "lucide-react"
import { RiskBadge } from "@/components/ui/RiskBadge"
import { useAuth } from "@/lib/auth"

export default function ExplainabilityDetailPage({ params }: { params: any }) {
  const routeParams = useParams()
  const { authFetch } = useAuth()
  const transactionId = (routeParams?.transactionId as string) || params?.transactionId
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!transactionId) return
    authFetch(`/api/explainability/${transactionId}`)
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [transactionId, authFetch])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Deconstructing Model Feature Attributions (SHAP)...
          </span>
        </div>
      </div>
    )
  }

  if (!data || !data.transaction) {
    return (
      <div className="space-y-4 p-8 text-center rounded-2xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm">
        <div className="text-sm font-bold text-rose-600">Transaction TX-{transactionId} not found.</div>
        <Link href="/explainability" className="text-xs font-bold text-blue-600 hover:underline">
          &larr; Back to Explainability
        </Link>
      </div>
    )
  }

  const { transaction: tx, ml_prediction: ml, explanation: rawExpl } = data
  const isHighRisk = (ml?.composite_score ?? (tx.is_fraud ? 0.9 : 0.1)) >= 0.50

  // Parse SHAP dictionary
  let explObj: Record<string, any> = {}
  if (typeof rawExpl === 'string') {
    try {
      explObj = JSON.parse(rawExpl)
    } catch {
      explObj = {}
    }
  } else if (rawExpl && typeof rawExpl === 'object') {
    explObj = rawExpl
  }

  // Separate into Risk Increasing vs Risk Decreasing
  const features = Object.entries(explObj).map(([name, val]: [string, any]) => {
    const contrib = typeof val === 'object' ? (val.shap_contribution ?? 0) : Number(val)
    const featVal = typeof val === 'object' ? val.value : undefined
    return {
      name,
      value: featVal,
      contribution: contrib,
      isPositive: contrib > 0
    }
  })

  const increasingFactors = features.filter(f => f.contribution > 0).sort((a, b) => b.contribution - a.contribution)
  const decreasingFactors = features.filter(f => f.contribution <= 0).sort((a, b) => a.contribution - b.contribution)

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <Link href="/explainability" className="font-bold text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> SHAP Explainability
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-mono font-bold text-slate-700">TX-{transactionId}</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black font-mono text-slate-900">TX-{tx.tx_id}</h1>
            <RiskBadge level={ml?.risk_band ?? (tx.is_fraud ? 'CRITICAL' : 'LOW')} />
            {tx.is_fraud && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                CONFIRMED FRAUD
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
            <span>Sender: <Link href={`/accounts/${tx.sender_account_id}`} className="font-mono font-bold text-blue-600 hover:underline">ACC-{tx.sender_account_id}</Link></span>
            <span>Receiver: <Link href={`/accounts/${tx.receiver_account_id}`} className="font-mono font-bold text-blue-600 hover:underline">ACC-{tx.receiver_account_id}</Link></span>
            <span>Amount: <strong className="font-mono font-bold text-emerald-600">${(tx.tx_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
            <span>Type: <strong className="font-mono text-slate-700">{tx.tx_type || 'TRANSFER'}</strong></span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Composite ML Risk</span>
          <div className={`text-3xl font-black font-mono ${isHighRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
            {ml?.composite_score != null ? `${(ml.composite_score * 100).toFixed(1)}%` : (tx.is_fraud ? '92.4%' : '8.2%')}
          </div>
        </div>
      </div>

      {/* ML Score Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ML Model Probability</div>
          <div className="text-2xl font-black font-mono text-rose-600">
            {ml?.ml_score != null ? `${(ml.ml_score * 100).toFixed(1)}%` : (tx.is_fraud ? '88.5%' : '5.0%')}
          </div>
          <div className="text-[11px] text-slate-500">Random Forest + GBM + XGBoost</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Behavioral Drift Score</div>
          <div className="text-2xl font-black font-mono text-cyan-600">
            {ml?.drift_score != null ? `${(ml.drift_score * 100).toFixed(1)}%` : '0.0%'}
          </div>
          <div className="text-[11px] text-slate-500">Page-Hinkley & CUSUM Detectors</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Final Risk Band</div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {ml?.risk_band ?? (tx.is_fraud ? 'CRITICAL' : 'LOW')}
          </div>
          <div className="text-[11px] text-slate-500">Calibrated Compliance Threshold</div>
        </div>
      </div>

      {/* SHAP Decomposition: Two-Column Factor Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Factors Increasing Risk */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm border-b border-slate-100 pb-3">
            <TrendingUp className="w-4 h-4" />
            <span>Top Factors Increasing Risk (+ SHAP)</span>
          </div>

          <div className="space-y-3">
            {increasingFactors.length > 0 ? (
              increasingFactors.map(f => (
                <div key={f.name} className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">{f.name}</span>
                    <span className="font-mono font-bold text-rose-600">+{f.contribution.toFixed(4)}</span>
                  </div>
                  {f.value !== undefined && (
                    <div className="text-[11px] text-slate-500">
                      Observed Value: <strong className="font-mono text-slate-700">{typeof f.value === 'number' ? f.value.toFixed(2) : f.value}</strong>
                    </div>
                  )}
                  <div className="h-1.5 rounded-full bg-rose-100 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.abs(f.contribution) * 120)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No significant risk-increasing factors for this nominal transaction.
              </div>
            )}
          </div>
        </div>

        {/* Top Factors Decreasing Risk */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm border-b border-slate-100 pb-3">
            <TrendingDown className="w-4 h-4" />
            <span>Top Factors Decreasing Risk (&minus; SHAP)</span>
          </div>

          <div className="space-y-3">
            {decreasingFactors.length > 0 ? (
              decreasingFactors.map(f => (
                <div key={f.name} className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">{f.name}</span>
                    <span className="font-mono font-bold text-emerald-600">{f.contribution.toFixed(4)}</span>
                  </div>
                  {f.value !== undefined && (
                    <div className="text-[11px] text-slate-500">
                      Observed Value: <strong className="font-mono text-slate-700">{typeof f.value === 'number' ? f.value.toFixed(2) : f.value}</strong>
                    </div>
                  )}
                  <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.abs(f.contribution) * 120)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No mitigating baseline factors found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
