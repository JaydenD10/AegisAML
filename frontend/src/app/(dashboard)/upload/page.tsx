'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  Sparkles,
  Layers,
  RotateCcw,
  Activity,
  Check
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuth } from '@/lib/auth'

interface PipelineJobStatus {
  job_id: string
  status: 'processing' | 'success' | 'failed'
  progress: number
  stage: string
  details?: Record<string, any>
  summary?: Record<string, any>
  error?: string
}

export default function UploadPage() {
  const router = useRouter()
  const { authFetch } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [datasetType, setDatasetType] = useState<'transactions' | 'accounts'>('transactions')
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [jobStatus, setJobStatus] = useState<PipelineJobStatus | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid .CSV spreadsheet file.')
      setFile(null)
      return
    }
    setError('')
    setJobStatus(null)
    setActiveJobId(null)
    setFile(selectedFile)
  }

  // Poll background job status
  useEffect(() => {
    if (!activeJobId) return

    const pollStatus = async () => {
      try {
        const res = await authFetch(`/api/upload/status/${activeJobId}`)
        if (!res.ok) return
        const data: PipelineJobStatus = await res.json()
        setJobStatus(data)

        if (data.status === 'success') {
          setUploading(false)
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        } else if (data.status === 'failed') {
          setUploading(false)
          setError(data.error || 'Pipeline execution failed.')
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        }
      } catch (err: any) {
        console.error('Failed to poll job status:', err)
      }
    }

    pollStatus()
    pollIntervalRef.current = setInterval(pollStatus, 500)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [activeJobId, authFetch])

  const handleExecutePipeline = async () => {
    if (!file) {
      setError('Please upload or drag & drop a CSV file first.')
      return
    }

    setUploading(true)
    setError('')
    setJobStatus({
      job_id: '',
      status: 'processing',
      progress: 5,
      stage: 'Uploading CSV & Initializing Ingestion...'
    })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('dataset_type', datasetType)

      const res = await authFetch('/api/upload/pipeline', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Upload pipeline initialization failed.')
      }

      const data = await res.json()
      if (data.job_id) {
        setActiveJobId(data.job_id)
      } else if (data.status === 'success') {
        // Direct synchronous response fallback
        setJobStatus({
          job_id: 'sync_done',
          status: 'success',
          progress: 100,
          stage: 'Pipeline Processing Complete',
          summary: data
        })
        setUploading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error initiating upload pipeline.')
      setUploading(false)
      setJobStatus(null)
    }
  }

  const handleRetry = () => {
    setError('')
    setJobStatus(null)
    setActiveJobId(null)
    setUploading(false)
  }

  const stagesList = [
    { label: 'CSV Upload & Schema Validation', threshold: 15 },
    { label: 'Entity Mapping & Accounts Topology', threshold: 30 },
    { label: 'Feature Engineering & Network Topologies', threshold: 50 },
    { label: 'Behavioral Drift Scoring (Page-Hinkley, CUSUM, Z-Score)', threshold: 68 },
    { label: 'ML Risk Inference & TreeExplainer SHAP', threshold: 85 },
    { label: 'Database Persistence & Finalization', threshold: 95 },
  ]

  const currentProgress = jobStatus?.progress || (uploading ? 5 : 0)

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Multi-Tenant Data Ingestion Pipeline"
        subtitle="Ingest transaction and KYC data into your isolated PostgreSQL workspace with automated ML feature engineering, drift calculation, and SHAP explainability."
      />

      {/* Main 3D Liquid Glass Dropzone Card */}
      <div className="glass-panel-3d p-6 sm:p-8 space-y-6">
        
        {/* Step 1: Select Type */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Dataset Format</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">Select Ingestion Entity Type</h3>
          </div>
          <div className="flex gap-2 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setDatasetType('transactions')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                datasetType === 'transactions'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Transactions Surveillance
            </button>
            <button
              type="button"
              onClick={() => setDatasetType('accounts')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                datasetType === 'accounts'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Account Entities / KYC
            </button>
          </div>
        </div>

        {/* 3D Liquid Glass Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`rounded-3xl p-8 sm:p-12 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center relative overflow-hidden ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01] dropzone-glow'
              : file
              ? 'border-emerald-500/60 bg-emerald-50/20'
              : 'border-slate-300/80 hover:border-blue-400 bg-white/40 hover:bg-white/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />

          {file ? (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto bg-emerald-100 text-emerald-600 border border-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.25)]">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-900">{file.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB · Ready to ingest into workspace
                </div>
              </div>
              {!uploading && (
                <span className="text-[11px] font-bold text-blue-600 hover:underline">
                  Click or drop another file to replace
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)]">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900">
                  Drop your CSV dataset here, or <span className="text-blue-600 underline">browse</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Supports standard AML surveillance CSV schemas with multi-tenant PostgreSQL persistence.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progressive Pipeline Execution Status */}
        {uploading && (
          <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-200/80 space-y-4 page-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm font-black text-slate-900">
                  {jobStatus?.stage || 'Processing Pipeline...'}
                </span>
              </div>
              <span className="font-mono text-xs font-black text-blue-700 bg-blue-100/90 px-2.5 py-1 rounded-full">
                {currentProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${currentProgress}%` }}
              />
            </div>

            {/* Progressive Stage Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {stagesList.map((stg, idx) => {
                const isDone = currentProgress >= stg.threshold
                const isCurrent = currentProgress < stg.threshold && (idx === 0 || currentProgress >= stagesList[idx - 1].threshold)
                return (
                  <div
                    key={stg.label}
                    className={`flex items-center gap-2 text-xs p-2 rounded-xl transition-colors ${
                      isDone
                        ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                        : isCurrent
                        ? 'text-blue-700 bg-white shadow-sm font-extrabold animate-pulse'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className="truncate">{stg.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Button & Status */}
        {!uploading && !jobStatus?.summary && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500">
              {file ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready to run ML pipeline on {file.name}</span>
                </div>
              ) : (
                <span>Select or drop a CSV file to execute the ingestion pipeline</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleExecutePipeline}
              disabled={!file || uploading}
              className="btn-glass-primary px-7 py-3 text-xs w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Run Ingestion Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert with Retry */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 page-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleRetry}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Processing</span>
            </button>
          </div>
        )}

        {/* Ingestion Results Card */}
        {jobStatus?.status === 'success' && jobStatus?.summary && (
          <div className="p-6 sm:p-7 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-5 shadow-sm page-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5 text-emerald-800 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Dataset processed successfully</span>
              </div>
              <Link
                href="/dashboard"
                className="btn-glass-primary px-5 py-2 text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-200/80 text-center shadow-xs">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Transactions Ingested</div>
                <div className="text-xl font-black font-mono text-slate-900 mt-1">
                  {(jobStatus.summary.transactions_imported || 0).toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-200/80 text-center shadow-xs">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Accounts Monitored</div>
                <div className="text-xl font-black font-mono text-slate-900 mt-1">
                  {(jobStatus.summary.accounts_imported || 0).toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-200/80 text-center shadow-xs">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Alerts Flagged</div>
                <div className="text-xl font-black font-mono text-rose-600 mt-1">
                  {(jobStatus.summary.alerts_generated || 0).toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-200/80 text-center shadow-xs">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">SHAP Forensics</div>
                <div className="text-xl font-black font-mono text-blue-600 mt-1">
                  {(jobStatus.summary.explanations_generated || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Risk Distribution Breakdown */}
            {jobStatus.summary.risk_distribution && (
              <div className="p-4 rounded-2xl bg-white/80 border border-emerald-200/70 space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Model Ensemble Risk Distribution
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                    <div>Critical</div>
                    <div className="text-sm font-black font-mono mt-0.5">
                      {jobStatus.summary.risk_distribution.CRITICAL?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-bold">
                    <div>High</div>
                    <div className="text-sm font-black font-mono mt-0.5">
                      {jobStatus.summary.risk_distribution.HIGH?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold">
                    <div>Medium</div>
                    <div className="text-sm font-black font-mono mt-0.5">
                      {jobStatus.summary.risk_distribution.MEDIUM?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                    <div>Low</div>
                    <div className="text-sm font-black font-mono mt-0.5">
                      {jobStatus.summary.risk_distribution.LOW?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Schema Reference Panel */}
      <div className="glass-panel-3d p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-slate-900 font-bold text-xs">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Expected CSV Schema Reference</span>
        </div>
        <p className="text-xs text-slate-500">
          Your CSV file must include columns: <code className="font-mono font-bold text-slate-800">tx_id</code>, <code className="font-mono font-bold text-slate-800">sender_account_id</code>, <code className="font-mono font-bold text-slate-800">receiver_account_id</code>, <code className="font-mono font-bold text-slate-800">tx_type</code>, <code className="font-mono font-bold text-slate-800">tx_amount</code>, <code className="font-mono font-bold text-slate-800">timestamp</code>, and optionally <code className="font-mono font-bold text-slate-800">is_fraud</code>.
        </p>
      </div>
    </div>
  )
}
