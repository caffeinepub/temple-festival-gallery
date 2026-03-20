import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  LogOut,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PhotoMetadata } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddPhoto,
  useDeletePhoto,
  useGetAllPhotos,
  useInitializeAccessControl,
  useIsAdmin,
  useUpdatePhoto,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

export default function AdminPage() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();
  const isLoggedIn = !!identity;
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsAdmin();
  const { data: photos, isLoading: isLoadingPhotos } = useGetAllPhotos();
  const addPhoto = useAddPhoto();
  const deletePhoto = useDeletePhoto();
  const updatePhoto = useUpdatePhoto();
  const initAccess = useInitializeAccessControl();

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress] = useState(0);
  const [isInitializing2, setIsInitializing2] = useState(false);

  const [editingPhoto, setEditingPhoto] = useState<PhotoMetadata | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Track if we've already triggered init for this login session
  const hasInitialized = useRef(false);

  // When user logs in and actor is ready, call initializeAccessControl
  useEffect(() => {
    if (isLoggedIn && actor && !isActorFetching && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsInitializing2(true);
      initAccess.mutate(undefined, {
        onSettled: () => {
          setIsInitializing2(false);
        },
      });
    }
    if (!isLoggedIn) {
      hasInitialized.current = false;
    }
  }, [isLoggedIn, actor, isActorFetching, initAccess.mutate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) return;
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
      await addPhoto.mutateAsync({
        title: uploadTitle,
        description: uploadDescription,
        fileBytes,
      });
      setUploadTitle("");
      setUploadDescription("");
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      toast.success("Photo uploaded successfully!");
    } catch {
      toast.error("Failed to upload photo. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePhoto.mutateAsync(id);
      toast.success("Photo deleted.");
    } catch {
      toast.error("Failed to delete photo.");
    }
  };

  const openEdit = (photo: PhotoMetadata) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditDescription(photo.description);
  };

  const handleUpdate = async () => {
    if (!editingPhoto) return;
    try {
      await updatePhoto.mutateAsync({
        id: editingPhoto.id,
        title: editTitle,
        description: editDescription,
      });
      setEditingPhoto(null);
      toast.success("Photo updated successfully!");
    } catch {
      toast.error("Failed to update photo.");
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="text-5xl mb-6">🪔</div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Admin <span className="text-gold">Panel</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to manage the festival gallery
          </p>
          <div
            className="p-8 rounded-xl border border-border"
            style={{ background: "oklch(0.16 0.02 55)" }}
          >
            <Button
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              className="w-full gradient-gold text-primary-foreground font-semibold py-3 shadow-gold"
              data-ocid="admin.login.button"
            >
              {loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                  in...
                </>
              ) : (
                "Sign In with Internet Identity"
              )}
            </Button>
            {loginStatus === "loginError" && (
              <p
                className="mt-3 text-sm text-destructive"
                data-ocid="admin.login.error_state"
              >
                Login failed. Please try again.
              </p>
            )}
          </div>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
            data-ocid="admin.back.link"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Gallery
          </Link>
        </motion.div>
      </div>
    );
  }

  // Show loading while we initialize access control or check admin status
  if (isInitializing2 || isCheckingAdmin) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center gap-3"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="text-sm text-muted-foreground">
          {isInitializing2 ? "Setting up access..." : "Checking permissions..."}
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
            Access Restricted
          </h2>
          <p className="text-muted-foreground mb-6">
            Your account does not have admin privileges.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => clear()}
              data-ocid="admin.logout.button"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
            <Link to="/">
              <Button variant="ghost" data-ocid="admin.gallery.link">
                Back to Gallery
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header
        className="border-b border-border px-6 py-4 flex items-center justify-between"
        style={{ background: "oklch(0.14 0.02 55)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🪔</span>
          <div>
            <h1 className="font-serif font-bold text-foreground">
              Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground">
              Sri Mahadeva Temple Gallery
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" data-ocid="admin.gallery.link">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Gallery
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clear()}
            className="border-border text-muted-foreground hover:text-foreground"
            data-ocid="admin.logout.button"
          >
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <ImagePlus className="h-6 w-6 text-gold" />
            Upload New Photo
          </h2>
          <div
            className="rounded-xl border border-border p-6"
            style={{ background: "oklch(0.16 0.02 55)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File picker */}
              <div>
                <Label className="text-foreground mb-2 block">
                  Festival Photo
                </Label>
                <label
                  className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-border hover:border-gold/50 cursor-pointer transition-colors"
                  style={{ background: "oklch(0.13 0.015 55)" }}
                  data-ocid="upload.dropzone"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to select an image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, WEBP
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    data-ocid="upload.input"
                  />
                </label>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label
                    htmlFor="upload-title"
                    className="text-foreground mb-1 block"
                  >
                    Title *
                  </Label>
                  <Input
                    id="upload-title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Evening Aarti Ceremony"
                    className="bg-input border-border focus:border-gold/50"
                    data-ocid="upload.title.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="upload-desc"
                    className="text-foreground mb-1 block"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="upload-desc"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Describe this sacred moment..."
                    rows={4}
                    className="bg-input border-border focus:border-gold/50 resize-none"
                    data-ocid="upload.description.textarea"
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={
                    !selectedFile || !uploadTitle.trim() || addPhoto.isPending
                  }
                  className="gradient-gold text-primary-foreground font-semibold mt-auto shadow-gold"
                  data-ocid="upload.submit_button"
                >
                  {addPhoto.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Uploading...{" "}
                      {uploadProgress > 0 ? `${uploadProgress}%` : ""}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Upload Photo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Photos Management Grid */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            Manage Photos
            {photos && (
              <span className="ml-3 text-sm font-sans font-normal text-muted-foreground">
                ({photos.length} photo{photos.length !== 1 ? "s" : ""})
              </span>
            )}
          </h2>

          {isLoadingPhotos ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              data-ocid="admin.photos.loading_state"
            >
              {SKELETON_KEYS.map((key) => (
                <Skeleton key={key} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          ) : photos && photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {photos.map((photo: PhotoMetadata, i: number) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl overflow-hidden border border-border group"
                    style={{ background: "oklch(0.16 0.02 55)" }}
                    data-ocid={`admin.photos.item.${i + 1}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={photo.blob.getDirectURL()}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(photo)}
                          className="border-gold/50 text-gold hover:bg-gold/10"
                          data-ocid={`admin.photos.edit_button.${i + 1}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                              data-ocid={`admin.photos.delete_button.${i + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            style={{
                              background: "oklch(0.18 0.025 55)",
                              borderColor: "oklch(0.3 0.04 60)",
                            }}
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-serif text-foreground">
                                Delete Photo?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                This will permanently remove "{photo.title}"
                                from the gallery.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="border-border"
                                data-ocid={`admin.delete.cancel_button.${i + 1}`}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(photo.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-ocid={`admin.delete.confirm_button.${i + 1}`}
                              >
                                {deletePhoto.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground truncate">
                        {photo.title}
                      </h3>
                      {photo.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div
              className="text-center py-16 rounded-xl border border-dashed border-border"
              data-ocid="admin.photos.empty_state"
            >
              <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No photos yet. Upload your first festival photo above.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPhoto}
        onOpenChange={(open) => !open && setEditingPhoto(null)}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{
            background: "oklch(0.18 0.025 55)",
            borderColor: "oklch(0.3 0.04 60)",
          }}
          data-ocid="admin.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">
              Edit Photo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label
                htmlFor="edit-title"
                className="text-foreground mb-1 block"
              >
                Title *
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-input border-border focus:border-gold/50"
                data-ocid="admin.edit.title.input"
              />
            </div>
            <div>
              <Label htmlFor="edit-desc" className="text-foreground mb-1 block">
                Description
              </Label>
              <Textarea
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="bg-input border-border focus:border-gold/50 resize-none"
                data-ocid="admin.edit.description.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditingPhoto(null)}
              data-ocid="admin.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editTitle.trim() || updatePhoto.isPending}
              className="gradient-gold text-primary-foreground"
              data-ocid="admin.edit.save_button"
            >
              {updatePhoto.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border py-6 px-6 text-center mt-10">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Sri Mahadeva Temple. Built with love
          using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-bright transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
