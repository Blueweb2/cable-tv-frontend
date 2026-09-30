"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadSitePhoto } from "@/lib/assignment.api";
import type { Assignment, PhotoType } from "@/types/assignment";

interface SitePhotosUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  duty: Assignment;
  token: string;
  onPhotoUploaded: (updatedDuty: Assignment) => void;
}

export default function SitePhotosUploadModal({
  isOpen,
  onClose,
  duty,
  token,
  onPhotoUploaded,
}: SitePhotosUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [photoType, setPhotoType] = useState<PhotoType>("AFTER_WORK");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select or capture a photo first.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const res = await uploadSitePhoto(
        duty._id,
        selectedFile,
        { caption, photoType },
        token
      );
      onPhotoUploaded(res.duty);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to upload site photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-2xl text-slate-100 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-[#00d2ff]">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Site Photo Proof</h3>
              <p className="text-xs text-slate-400">Capture optical readings, fiber splices, or repair evidence</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="mt-4 space-y-4">
          {/* Image Picker Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-6 text-center cursor-pointer transition hover:border-sky-500 hover:bg-slate-900"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full">
                <img
                  src={previewUrl}
                  alt="Site preview"
                  className="mx-auto max-h-52 rounded-xl object-contain shadow-md"
                />
                <p className="mt-2 text-xs font-semibold text-sky-400">
                  Tap to change photo
                </p>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-[#00d2ff] mb-2">
                  <Camera size={24} />
                </div>
                <p className="text-xs font-bold text-white">
                  Take Photo or Select Image
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Supports Camera capture, JPG, PNG & WebP up to 10MB
                </p>
              </>
            )}
          </div>

          {/* Photo Category / Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Photo Evidence Type
            </label>
            <select
              value={photoType}
              onChange={(e) => setPhotoType(e.target.value as PhotoType)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            >
              <option value="AFTER_WORK">After Work / Completion Proof ✓</option>
              <option value="BEFORE_WORK">Before Work / Initial Site State</option>
              <option value="METER_READING">OTDR / Optical Power Meter Reading (dBm)</option>
              <option value="DAMAGE_EVIDENCE">Damage / Fiber Cut Evidence</option>
              <option value="IN_PROGRESS">In Progress Splicing / Wiring</option>
              <option value="OTHER">Other Site Documentation</option>
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Photo Caption / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Core #4 Spliced & Optical power measured at -17.8 dBm"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-500 hover:to-cyan-500 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload Photo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
