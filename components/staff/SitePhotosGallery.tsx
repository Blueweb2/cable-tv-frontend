"use client";

import { useState } from "react";
import { Camera, Eye, Trash2, X, Clock, User, Download } from "lucide-react";
import type { SitePhoto } from "@/types/assignment";

interface SitePhotosGalleryProps {
  photos?: SitePhoto[];
  title?: string;
  onDeletePhoto?: (photoId: string) => void;
  canDelete?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function SitePhotosGallery({
  photos = [],
  title,
  onDeletePhoto,
  canDelete = false,
}: SitePhotosGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<SitePhoto | null>(null);

  if (!photos || photos.length === 0) {
    return null;
  }

  const getFullUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url;
    }
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getPhotoTypeLabel = (type?: string) => {
    switch (type) {
      case "AFTER_WORK":
        return "Completion Proof";
      case "BEFORE_WORK":
        return "Before Work";
      case "METER_READING":
        return "Optical Meter (dBm)";
      case "DAMAGE_EVIDENCE":
        return "Damage Evidence";
      case "IN_PROGRESS":
        return "In Progress";
      default:
        return "Site Photo";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Camera size={14} className="text-[#00d2ff]" />
          Site Photos ({photos.length})
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((photo, i) => (
          <div
            key={photo._id || i}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900 cursor-pointer transition hover:border-sky-500 hover:shadow-md"
          >
            <img
              src={getFullUrl(photo.url)}
              alt={photo.caption || "Site photo"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
              <span className="text-[9px] font-bold text-sky-300 truncate">
                {getPhotoTypeLabel(photo.photoType)}
              </span>
              {photo.caption && (
                <span className="text-[8px] text-slate-300 truncate">
                  {photo.caption}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-3xl w-full rounded-2xl border border-slate-800 bg-[#0b1120] p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
                  {getPhotoTypeLabel(selectedPhoto.photoType)}
                </span>
                {selectedPhoto.caption && (
                  <h4 className="mt-1 font-bold text-sm text-white">
                    {selectedPhoto.caption}
                  </h4>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canDelete && selectedPhoto._id && onDeletePhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeletePhoto(selectedPhoto._id!);
                      setSelectedPhoto(null);
                    }}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                    title="Delete Photo"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="mt-3 flex justify-center bg-black/50 rounded-xl overflow-hidden max-h-[65vh]">
              <img
                src={getFullUrl(selectedPhoto.url)}
                alt={selectedPhoto.caption || "Site photo full"}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {selectedPhoto.uploadedBy?.name && (
                  <span className="flex items-center gap-1">
                    <User size={13} className="text-sky-400" />
                    {selectedPhoto.uploadedBy.name}
                  </span>
                )}
                {selectedPhoto.uploadedAt && (
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {new Date(selectedPhoto.uploadedAt).toLocaleString()}
                  </span>
                )}
              </div>

              <a
                href={getFullUrl(selectedPhoto.url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-400 hover:underline font-semibold"
              >
                <Download size={13} /> Open full resolution
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
