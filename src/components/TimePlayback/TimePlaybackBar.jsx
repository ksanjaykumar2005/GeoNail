/**
 * 4D Geotechnical Time Playback Control Bar
 * Forensic time-scrubbing bar for replaying ground subsidence evolution over 1h, 6h, 24h intervals.
 * GeoNail - Mine Safety Monitoring System | SIH PS 26025
 */

import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind, Clock, History } from 'lucide-react';
import { format } from 'date-fns';

export function TimePlaybackBar({
  playbackMode = 'LIVE',
  setPlaybackMode = () => {},
  playbackPreset = 'CURRENT',
  setPlaybackPreset = () => {},
  playbackIndex = 100,
  setPlaybackIndex = () => {},
  isPlaying = false,
  setIsPlaying = () => {}
}) {
  const now = new Date();
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Compute simulated timestamp corresponding to playbackIndex
  const currentScrubbedTime = new Date(startTime.getTime() + (playbackIndex / 100) * (now.getTime() - startTime.getTime()));

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-2.5 px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono select-none shadow-sm">
      {/* Left Mode & Presets */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setPlaybackMode('LIVE');
            setPlaybackPreset('CURRENT');
            setPlaybackIndex(100);
            setIsPlaying(false);
          }}
          className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 text-xs ${
            playbackMode === 'LIVE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>LIVE</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200" />

        {/* Time Presets */}
        {['CURRENT', '1H', '6H', '24H', 'CUSTOM'].map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setPlaybackMode('PLAYBACK');
              setPlaybackPreset(preset);
              if (preset === 'CURRENT') setPlaybackIndex(100);
              else if (preset === '1H') setPlaybackIndex(85);
              else if (preset === '6H') setPlaybackIndex(50);
              else if (preset === '24H') setPlaybackIndex(10);
            }}
            className={`px-2.5 py-1 rounded transition-colors text-[11px] font-medium ${
              playbackPreset === preset && playbackMode === 'PLAYBACK'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {preset === 'CURRENT' ? 'Now' : preset}
          </button>
        ))}
      </div>

      {/* Middle Scrubbing Slider */}
      <div className="flex-1 max-w-xl flex items-center gap-3 w-full">
        <span className="text-slate-400 text-[11px] whitespace-nowrap">
          -24h ({format(startTime, 'HH:mm')})
        </span>

        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={playbackIndex}
            onChange={(e) => {
              setPlaybackMode('PLAYBACK');
              setPlaybackPreset('CUSTOM');
              setPlaybackIndex(Number(e.target.value));
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <span className="text-slate-800 text-[11px] whitespace-nowrap font-bold">
          {playbackMode === 'LIVE' ? 'NOW (LIVE)' : format(currentScrubbedTime, 'HH:mm:ss')}
        </span>
      </div>

      {/* Right Play / Pause / Step Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            setPlaybackMode('PLAYBACK');
            setPlaybackIndex(0);
          }}
          className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
          title="Rewind to start"
        >
          <Rewind className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            setPlaybackMode('PLAYBACK');
            setIsPlaying(!isPlaying);
          }}
          className={`px-3 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors text-xs ${
            isPlaying
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY 4D'}</span>
        </button>

        <button
          onClick={() => {
            setPlaybackMode('PLAYBACK');
            setPlaybackIndex(100);
          }}
          className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
          title="Fast forward to latest"
        >
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

