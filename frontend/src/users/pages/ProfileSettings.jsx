import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import { fetchCurrentUser, updateCurrentUserProfile } from "../services/userService.js";
import { clearPromptCache } from "../services/promptService.js";

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function CropModal({ imageUrl, onCancel, onApply }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  const drawCrop = useCallback((image, scale) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 260;
    const context = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;
    context.clearRect(0, 0, size, size);
    context.save();
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    context.clip();

    const baseScale = Math.max(size / image.width, size / image.height);
    const drawWidth = image.width * baseScale * scale;
    const drawHeight = image.height * baseScale * scale;
    const x = (size - drawWidth) / 2;
    const y = (size - drawHeight) / 2;

    context.drawImage(image, x, y, drawWidth, drawHeight);
    context.restore();
  }, []);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      drawCrop(image, zoom);
    };
    image.src = imageUrl;
  }, [drawCrop, imageUrl, zoom]);

  useEffect(() => {
    if (imageRef.current) drawCrop(imageRef.current, zoom);
  }, [drawCrop, zoom]);

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) onApply(blob, canvas.toDataURL("image/png"));
    }, "image/png");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-[#070814] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-base font-black text-violet-300">Crop Profile Photo</h2>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-violet-500/20 hover:text-violet-300"
          >
            x
          </button>
        </div>

        <div className="p-5">
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="rounded-full ring-4 ring-violet-500/35" />
          </div>

          <label className="mt-5 block text-sm font-black text-slate-300">
            Zoom
          </label>
          <input
            type="range"
            min="1"
            max="2.5"
            step="0.05"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="mt-2 w-full accent-violet-500"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-black text-white transition hover:bg-violet-500"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSettings() {
  const { reloadCurrentUser } = useOutletContext() ?? {};
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [cropSource, setCropSource] = useState("");
  const [saving, setSaving] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const currentUser = await fetchCurrentUser().catch(() => null);
      if (cancelled || !currentUser) return;

      setUser(currentUser);
      setName(currentUser.displayName ?? "");
      setEmail(currentUser.email ?? "");
      setBio(currentUser.creatorBio ?? "");
      setAvatarPreview(currentUser.avatarUrl ?? "");
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be 5MB or less.");
      return;
    }

    const dataUrl = await readImageFile(file);
    setCropSource(dataUrl);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updated = await updateCurrentUserProfile({
        name,
        email,
        bio,
        imageBlob: croppedBlob,
      });

      setUser(updated);
      setAvatarPreview(`${updated.avatarUrl}${updated.avatarUrl.includes("?") ? "&" : "?"}v=${Date.now()}`);
      reloadCurrentUser?.();
      clearPromptCache();
      window.dispatchEvent(new Event("promptai:user-profile-updated"));
      setSuccessVisible(true);
      setTimeout(() => setSuccessVisible(false), 2000);
    } catch (saveError) {
      setError(saveError.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {successVisible && (
        <div className="fixed right-6 top-24 z-[9999] rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-4 text-sm font-bold text-emerald-200 shadow-2xl">
          Profile changes saved successfully.
        </div>
      )}

      <div>
        <h1 className="text-lg font-black text-violet-300">Profile Setting</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your personal information and profile details.
        </p>
      </div>

      <form onSubmit={handleSave} className="surface-strong p-6">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside>
            <p className="text-sm font-black text-white">Profile Picture</p>
            <div className="mt-5 flex flex-col items-center">
              <img
                src={avatarPreview}
                alt={user?.displayName ?? "Profile"}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-violet-500/35"
              />
              {/* <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                JPG, GIF, PNG or WEBP. Max size of 5MB.
              </p> */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-xl border border-violet-500/60 px-5 py-2 text-sm font-black text-violet-300 transition hover:bg-violet-500/20"
              >
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </aside>

          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-black text-slate-300">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-200 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-300">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-200 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-300">Bio</span>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                placeholder="Write something about yourself..."
              />
            </label>

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {cropSource && (
        <CropModal
          imageUrl={cropSource}
          onCancel={() => setCropSource("")}
          onApply={(blob, previewUrl) => {
            setCroppedBlob(blob);
            setAvatarPreview(previewUrl);
            setCropSource("");
          }}
        />
      )}
    </div>
  );
}
