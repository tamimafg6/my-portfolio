"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { useAdminApi } from "@/lib/hooks/useAdminApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, FileText, Loader2, User } from "lucide-react";
import Image from "next/image";

interface ContactInfo {
  id?: number;
  email: string;
  phone: string | null;
  address: string | null;
  linkedIn: string | null;
  github: string | null;
  twitter: string | null;
  website: string | null;
  profilePhotoUrl?: string | null;
}

interface ResumeInfo {
  id?: number;
  fileUrl?: string;
  fileUrlEn?: string | null;
  fileUrlAr?: string | null;
  labelEn: string;
  labelAr: string;
}

const emptyContact: ContactInfo = {
  email: "",
  phone: "",
  address: "",
  linkedIn: "",
  github: "",
  twitter: "",
  website: "",
};

const emptyResume: ResumeInfo = {
  fileUrl: "",
  fileUrlEn: null,
  fileUrlAr: null,
  labelEn: "Resume",
  labelAr: "CV",
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.settingsPage");
  const tCommon = useTranslations("common");
  const { authorized, loading } = useAdminAccess();
  const { get, put, uploadFile, getToken } = useAdminApi();
  const [contactInfo, setContactInfo] = useState<ContactInfo>(emptyContact);
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo>(emptyResume);
  const [loadingContact, setLoadingContact] = useState(true);
  const [loadingResume, setLoadingResume] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [savingResume, setSavingResume] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadResumeError, setUploadResumeError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadPhotoError, setUploadPhotoError] = useState<string | null>(null);
  const [photoFileLabel, setPhotoFileLabel] = useState<string>("");
  const [resumeFileEnLabel, setResumeFileEnLabel] = useState<string>("");
  const [resumeFileArLabel, setResumeFileArLabel] = useState<string>("");
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileEnInputRef = useRef<HTMLInputElement>(null);
  const resumeFileArInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  useEffect(() => {
    if (!authorized) return;
    const fetchContact = async () => {
      try {
        const { data } = await get<ContactInfo>("/contact/info");
        if (data && typeof data === "object") {
          setContactInfo({
            email: data.email ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
            linkedIn: data.linkedIn ?? "",
            github: data.github ?? "",
            twitter: data.twitter ?? "",
            website: data.website ?? "",
            profilePhotoUrl: data.profilePhotoUrl ?? null,
          });
        }
      } catch (e) {
        console.error("Failed to fetch contact info:", e);
      } finally {
        setLoadingContact(false);
      }
    };
    const fetchResume = async () => {
      try {
        const { data } = await get<ResumeInfo>("/resume");
        if (data && typeof data === "object") {
          setResumeInfo({
            fileUrl: data.fileUrl ?? "",
            fileUrlEn: data.fileUrlEn ?? null,
            fileUrlAr: data.fileUrlAr ?? null,
            labelEn: data.labelEn ?? "Resume",
            labelAr: data.labelAr ?? "CV",
          });
        }
      } catch (e) {
        console.error("Failed to fetch resume:", e);
      } finally {
        setLoadingResume(false);
      }
    };
    fetchContact();
    fetchResume();
  }, [authorized, get]);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    setContactSuccess(false);
    try {
      const { data, error } = await put<ContactInfo>("/contact/info", contactInfo);
      if (data) {
        setContactSuccess(true);
        setTimeout(() => setContactSuccess(false), 3000);
      } else {
        alert(error || t("failedSaveContact"));
      }
    } catch (e) {
      console.error(e);
      alert(t("failedSaveContact"));
    } finally {
      setSavingContact(false);
    }
  };

  const handleSaveResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingResume(true);
    setResumeSuccess(false);
    try {
      const payload = {
        labelEn: resumeInfo.labelEn,
        labelAr: resumeInfo.labelAr,
      };
      const { data, error } = await put<ResumeInfo>("/resume", payload);
      if (data) {
        setResumeSuccess(true);
        setTimeout(() => setResumeSuccess(false), 3000);
      } else {
        alert(error || t("failedSaveContact"));
      }
    } catch (e) {
      console.error(e);
      alert(t("failedSaveContact"));
    } finally {
      setSavingResume(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];
    if (!file) {
      setUploadPhotoError("Please select an image (JPEG, PNG, or WebP).");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadPhotoError("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    setUploadingPhoto(true);
    setUploadPhotoError(null);
    try {
      const { data, error } = await uploadFile("/profile/photo/upload", file, "file");
      if (data && typeof data === "object") {
        const responseData = data as { profilePhotoUrl?: string };
        setContactInfo((prev) => ({ ...prev, profilePhotoUrl: responseData.profilePhotoUrl ?? "/api/profile/photo" }));
        fileInput.value = "";
        setPhotoFileLabel("");
      } else {
        setUploadPhotoError(error || "Failed to upload photo");
      }
    } catch (e) {
      console.error(e);
      setUploadPhotoError("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUploadResume = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const localeValue = (form.querySelector('input[name="locale"]') as HTMLInputElement)?.value === "fr" ? "fr" : "en";
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];
    if (!file) {
      setUploadResumeError("Please select a PDF file.");
      return;
    }
    if (file.type !== "application/pdf") {
      setUploadResumeError("Only PDF files are allowed.");
      return;
    }
    setUploadingResume(true);
    setUploadResumeError(null);
    try {
      const token = await getToken();
      if (!token) {
        setUploadResumeError("Not authenticated");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("locale", localeValue);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${API_BASE_URL}/resume/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResumeInfo((prev) => ({
          ...prev,
          fileUrlEn: data.fileUrlEn ?? prev.fileUrlEn,
          fileUrlAr: data.fileUrlAr ?? prev.fileUrlAr,
        }));
        setResumeSuccess(true);
        setTimeout(() => setResumeSuccess(false), 3000);
        fileInput.value = "";
        if (localeValue === "fr") setResumeFileArLabel("");
        else setResumeFileEnLabel("");
      } else {
        setUploadResumeError(data.error || t("failedUploadResume"));
      }
    } catch (e) {
      console.error(e);
      setUploadResumeError(t("failedUploadResume"));
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {t("contactInfo")}
            </CardTitle>
            <CardDescription>{t("contactDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingContact ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {tCommon("loading")}
              </div>
            ) : (
              <form onSubmit={handleSaveContact} className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-foreground">{t("email")} *</label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo((c) => ({ ...c, email: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="text-sm font-medium text-foreground">{t("address")}</label>
                  <Input
                    id="address"
                    type="text"
                    value={contactInfo.address ?? ""}
                    onChange={(e) => setContactInfo((c) => ({ ...c, address: e.target.value || null }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="linkedIn" className="text-sm font-medium text-foreground">{t("linkedInUrl")}</label>
                  <Input
                    id="linkedIn"
                    type="url"
                    value={contactInfo.linkedIn ?? ""}
                    onChange={(e) => setContactInfo((c) => ({ ...c, linkedIn: e.target.value || null }))}
                    placeholder="https://linkedin.com/in/..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="github" className="text-sm font-medium text-foreground">{t("githubUrl")}</label>
                  <Input
                    id="github"
                    type="url"
                    value={contactInfo.github ?? ""}
                    onChange={(e) => setContactInfo((c) => ({ ...c, github: e.target.value || null }))}
                    placeholder="https://github.com/..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="text-sm font-medium text-foreground">{t("websiteUrl")}</label>
                  <Input
                    id="website"
                    type="url"
                    value={contactInfo.website ?? ""}
                    onChange={(e) => setContactInfo((c) => ({ ...c, website: e.target.value || null }))}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={savingContact}>
                    {savingContact ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t("saving")}
                      </>
                    ) : (
                      t("saveContact")
                    )}
                  </Button>
                  {contactSuccess && (
                    <span className="text-sm text-green-600 dark:text-green-400">{t("saved")}</span>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Profile photo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t("profilePhoto")}
            </CardTitle>
            <CardDescription>{t("profilePhotoDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadPhoto} className="space-y-3">
              <div className="flex flex-wrap items-end gap-4">
                {contactInfo.profilePhotoUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted">
                    <Image
                      src="/api/profile/photo"
                      alt="Profile"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-end gap-3">
                  <input
                    ref={photoFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    aria-hidden
                    onChange={(e) => setPhotoFileLabel(e.target.files?.[0]?.name ?? "")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => photoFileInputRef.current?.click()}
                  >
                    {t("chooseFile")}
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-0 truncate max-w-[200px]">
                    {photoFileLabel || t("noFileChosen")}
                  </span>
                  <Button type="submit" disabled={uploadingPhoto}>
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {t("saving")}
                      </>
                    ) : (
                      t("uploadPhoto")
                    )}
                  </Button>
                </div>
              </div>
              {uploadPhotoError && (
                <p className="text-sm text-destructive">{uploadPhotoError}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Resume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t("resume")}
            </CardTitle>
            <CardDescription>{t("resumeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingResume ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {tCommon("loading")}
              </div>
            ) : (
              <div className="space-y-6">
                <form onSubmit={handleUploadResume} className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                  <input type="hidden" name="locale" value="en" />
                  <p className="text-sm font-medium text-foreground">{t("resumeEn")}</p>
                  <div className="flex flex-wrap items-end gap-3">
                    <input
                      ref={resumeFileEnInputRef}
                      type="file"
                      accept="application/pdf"
                      className="sr-only"
                      aria-hidden
                      onChange={(e) => setResumeFileEnLabel(e.target.files?.[0]?.name ?? "")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => resumeFileEnInputRef.current?.click()}
                    >
                      {t("chooseFile")}
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-0 truncate max-w-[200px]">
                      {resumeFileEnLabel || t("noFileChosen")}
                    </span>
                    <Button type="submit" disabled={uploadingResume}>
                      {uploadingResume ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {t("saving")}
                        </>
                      ) : (
                        t("uploadPdf")
                      )}
                    </Button>
                  </div>
                </form>
                <form onSubmit={handleUploadResume} className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                  <input type="hidden" name="locale" value="fr" />
                  <p className="text-sm font-medium text-foreground">{t("resumeFr")}</p>
                  <div className="flex flex-wrap items-end gap-3">
                    <input
                      ref={resumeFileArInputRef}
                      type="file"
                      accept="application/pdf"
                      className="sr-only"
                      aria-hidden
                      onChange={(e) => setResumeFileArLabel(e.target.files?.[0]?.name ?? "")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => resumeFileArInputRef.current?.click()}
                    >
                      {t("chooseFile")}
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-0 truncate max-w-[200px]">
                      {resumeFileArLabel || t("noFileChosen")}
                    </span>
                    <Button type="submit" disabled={uploadingResume}>
                      {uploadingResume ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {t("saving")}
                        </>
                      ) : (
                        t("uploadPdf")
                      )}
                    </Button>
                  </div>
                  {uploadResumeError && (
                    <p className="text-sm text-destructive">{uploadResumeError}</p>
                  )}
                </form>

                <form onSubmit={handleSaveResume} className="space-y-4 mt-6">
                  <p className="text-sm font-medium text-foreground">{t("buttonLabelOptional")}</p>
                  <div>
                    <label htmlFor="labelEn" className="text-sm font-medium text-foreground">{t("labelEn")}</label>
                    <Input
                      id="labelEn"
                      type="text"
                      value={resumeInfo.labelEn}
                      onChange={(e) => setResumeInfo((r) => ({ ...r, labelEn: e.target.value }))}
                      placeholder="e.g. Resume"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="labelAr" className="text-sm font-medium text-foreground">{t("labelAr")}</label>
                    <Input
                      id="labelAr"
                      type="text"
                      value={resumeInfo.labelAr}
                      onChange={(e) => setResumeInfo((r) => ({ ...r, labelAr: e.target.value }))}
                      placeholder="e.g. CV"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="submit" disabled={savingResume}>
                      {savingResume ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {t("saving")}
                        </>
                      ) : (
                        t("saveContact")
                      )}
                    </Button>
                    {resumeSuccess && (
                      <span className="text-sm text-green-600 dark:text-green-400">Saved.</span>
                    )}
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
