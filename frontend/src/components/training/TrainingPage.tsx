import React, { useCallback, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileJson,
  FileUp,
  FolderOutput,
  Info,
  RefreshCw,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { useTraining } from '../../hooks/useTraining';
import { TrainingMode } from '../../types/training';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { ModelComparisonTable } from '../benchmarks/ModelComparisonTable';
import { RocCurveChart } from '../benchmarks/RocCurveChart';
import { CalibrationPlot } from '../benchmarks/CalibrationPlot';

const ACCEPTED = ['.json', '.jsonl', '.ndjson', '.csv'];

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatPct(value?: number): string {
  return value != null ? `${(value * 100).toFixed(1)}%` : '—';
}

export const TrainingPage: React.FC = () => {
  const { schema, logs, result, lastMetrics, loading, error, train, reload } = useTraining();

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<TrainingMode>('append');
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const metrics = result ? { dataset_summary: result.dataset_summary, models: result.models } : lastMetrics;
  const summary = metrics?.dataset_summary;

  const selectFile = useCallback((candidate: File | null) => {
    if (!candidate) return;
    const ext = candidate.name.slice(candidate.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setLocalError(
        `Unsupported file type "${ext}". Select a ${ACCEPTED.join(', ')} file.`,
      );
      return;
    }
    setLocalError(null);
    setFile(candidate);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      selectFile(e.dataTransfer.files?.[0] ?? null);
    },
    [selectFile],
  );

  const handleTrain = async () => {
    if (!file) return;
    setLocalError(null);
    try {
      await train(file, mode);
    } catch (err: any) {
      setLocalError(err.message || 'Training failed.');
    }
  };

  const displayError = localError ?? error;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-teal-500" />
            Model Training &amp; Judgement Metrics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload a labeled dataset in JSON, JSONL, or CSV format to retrain the multi-model ensemble and
            inspect the complete held-out metrics returned by this run.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {schema && (
            <Badge variant="teal">
              <Database className="w-3 h-3 mr-1" />
              Corpus: {schema.corpus_rows} rows
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => reload()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh metadata
          </Button>
        </div>
      </div>

      {displayError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <div>
            <p className="font-bold">Training Failed</p>
            <p>{displayError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Upload column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileUp className="w-4 h-4 text-teal-500" />
              Upload training data
            </h3>

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed transition-all duration-150 p-6 text-center ${
                dragOver
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/50'
                  : 'border-slate-300 dark:border-slate-700 hover:border-teal-400/70'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(',')}
                className="hidden"
                onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
              />
              <div className="w-11 h-11 mx-auto rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center mb-3">
                <FileJson className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              {file ? (
                <>
                  <p className="text-xs font-bold text-slate-900 dark:text-white break-all">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {formatBytes(file.size)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-2 text-[11px] text-rose-500 hover:text-rose-600 font-semibold"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Drag &amp; drop a labeled dataset here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    or click to browse (JSON, JSONL, CSV) — min {schema?.minimum_rows ?? 50} rows
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <Select
                label="Training mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as TrainingMode)}
                options={[
                  { value: 'append', label: 'Append — merge with existing corpus and retrain' },
                  { value: 'replace', label: 'Replace — train only on this uploaded file' },
                ]}
                helperText={schema?.modes?.[mode]}
              />
              <Button
                className="w-full"
                isLoading={loading}
                disabled={!file}
                onClick={handleTrain}
                leftIcon={<Zap className="w-4 h-4" />}
              >
                {loading ? 'Training multi-model ensemble…' : 'Train the models'}
              </Button>
            </div>
          </Card>

          {/* File contract */}
          {schema && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-500" />
                Required file contract
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Accepted formats</p>
                  <div className="flex flex-wrap gap-1.5">
                    {schema.accepted_formats.map((fmt) => (
                      <Badge key={fmt} variant="slate" size="sm">
                        {fmt}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Required columns</p>
                  <div className="flex flex-wrap gap-1">
                    {schema.required_columns.map((col) => (
                      <span
                        key={col}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Target values</p>
                  {Object.entries(schema.target_values).map(([value, label]) => (
                    <p key={value} className="text-slate-500 dark:text-slate-400 font-mono">
                      {value} → {label}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Example JSON shapes</p>
                  <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] overflow-x-auto">
                    {schema.json_shapes.join('\n')}
                  </pre>
                </div>
              </div>
            </Card>
          )}

          {/* Log storage */}
          {logs && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FolderOutput className="w-4 h-4 text-teal-500" />
                Application log storage
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Runtime events are written to rotating files under:
              </p>
              <pre className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] overflow-x-auto">
                {logs.directory}
              </pre>
              <div className="mt-3 space-y-1.5">
                {logs.files.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400"
                  >
                    <span>{f.name}</span>
                    <span>{formatBytes(f.size_bytes)}</span>
                  </div>
                ))}
              </div>
              {logs.model_artifacts_directory && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Model artifacts: <span className="font-mono">{logs.model_artifacts_directory}</span>
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Results column */}
        <div className="lg:col-span-2 space-y-6">
          {metrics && summary ? (
            <>
              {/* Run meta */}
              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {result
                        ? 'Training completed — metrics from this run'
                        : 'Latest trained model metrics'}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {result?.message ?? 'Loaded from the persisted benchmark artifact of the last training run.'}
                    </p>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Test cohort', value: summary.test_samples },
                        { label: 'Corpus', value: summary.total_samples },
                        { label: 'Features', value: summary.n_features_transformed },
                        { label: 'Duration', value: result ? `${result.training_duration_seconds}s` : undefined },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-2"
                        >
                          <div className="text-base font-extrabold text-slate-900 dark:text-white">
                            {item.value ?? '—'}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    {(summary.train_samples != null || summary.test_samples != null) && (
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                        {summary.train_samples != null && (
                          <Badge variant="slate" size="sm">Train: {summary.train_samples}</Badge>
                        )}
                        {summary.calibration_samples != null && (
                          <Badge variant="slate" size="sm">Calibration: {summary.calibration_samples}</Badge>
                        )}
                        <Badge variant="slate" size="sm">Positive class: {formatPct(summary.positive_class_rate)}</Badge>
                        <Badge variant="slate" size="sm">Negative class: {formatPct(summary.negative_class_rate)}</Badge>
                        {summary.uploaded_rows != null && (
                          <Badge variant="slate" size="sm">Uploaded: {summary.uploaded_rows}</Badge>
                        )}
                        {summary.corpus_rows != null && (
                          <Badge variant="slate" size="sm">Corpus: {summary.corpus_rows}</Badge>
                        )}
                        {summary.merge_mode != null && (
                          <Badge variant="teal" size="sm">Mode: {summary.merge_mode}</Badge>
                        )}
                      </div>
                    )}
                    {result?.artifacts_path && (
                      <p className="mt-3 text-[11px] font-mono text-slate-400 break-all">
                        {result.artifacts_path}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <ModelComparisonTable benchmarks={metrics} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RocCurveChart benchmarks={metrics} />
                <CalibrationPlot benchmarks={metrics} />
              </div>
            </>
          ) : (
            <Card className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <UploadCloud className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No judgement metrics available yet
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Upload a labeled JSON, JSONL, or CSV dataset on the left and click{' '}
                <strong>“Train the models”</strong>. The complete held-out metrics — accuracy, ROC-AUC,
                precision, recall, F1, Brier score, confusion matrices, and calibration curves — will be
                returned here after training completes.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};