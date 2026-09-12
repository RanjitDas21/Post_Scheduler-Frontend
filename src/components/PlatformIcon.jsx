import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

export const PLATFORMS = {
  twitter: { label: "Twitter / X", icon: Twitter, tint: "#2B2420" },
  linkedin: { label: "LinkedIn", icon: Linkedin, tint: "#2F6FA0" },
  facebook: { label: "Facebook", icon: Facebook, tint: "#3B5998" },
  instagram: { label: "Instagram", icon: Instagram, tint: "#C1428A" },
};

const PlatformIcon = ({ platform, size = 16, className = "" }) => {
  const meta = PLATFORMS[platform];
  if (!meta) return null;
  const Icon = meta.icon;
  return <Icon size={size} className={className} style={{ color: meta.tint }} />;
};

export default PlatformIcon;
