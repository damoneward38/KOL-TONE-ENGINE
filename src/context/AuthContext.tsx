"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PlanTier = "free" | "pro" | "enterprise";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: PlanTier;
  clearance: "SOVEREIGN" | "RESEARCHER" | "EXPLORER";
  licenseKey: string;
  avatar?: string;
  joinedDate: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsSovereign: () => void;
  register: (name: string, email: string, password?: string, plan?: PlanTier) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  upgradeTier: (tier: PlanTier, licenseKey?: string) => void;
  canAccess: (feature: FeatureKey) => boolean;
  getFeatureGate: (feature: FeatureKey) => { allowed: boolean; requiredTier: PlanTier; featureName: string; reason: string };
  openPaywall: (featureKey: FeatureKey) => void;
  paywallModal: { isOpen: boolean; featureKey: FeatureKey | null; requiredTier: PlanTier; featureName: string; reason: string };
  closePaywall: () => void;
}

export type FeatureKey = 
  | "kol_basic"
  | "kol_unlimited"
  | "ayin_standard"
  | "ayin_advanced"     // IR, Thermal, UV, X-Ray, mmWave, Sonar
  | "nesher_neural"     // 8-channel EEG BCI
  | "ruach_basic"
  | "ruach_voice"      // Autonomous mic STT & speaker TTS
  | "kol_recording"    // Live Web Audio recording & custom synthesis
  | "neshima_chamber"  // Hyperbaric healing protocols
  | "zpe_casimir"      // Quantum Casimir force calculation & vacuum engine
  | "daat_pipeline"    // Unified 9-stage cross-system pipeline
  | "emet_master";     // 1-Click Sovereign Master Unification

const FEATURE_CONFIG: Record<FeatureKey, { name: string; minTier: PlanTier; reason: string }> = {
  kol_basic: { name: "Basic Stylometry Matching", minTier: "free", reason: "Standard psychometric tone extraction" },
  kol_unlimited: { name: "Unlimited KOL Profiles & Export", minTier: "pro", reason: "Vector JSON schema exports & multi-channel sync" },
  ayin_standard: { name: "Visible & Night Optical Modes", minTier: "free", reason: "Baseline optical spectrum viewing" },
  ayin_advanced: { name: "Multi-Spectral Sensor Fusion (X-Ray, mm-Wave, Thermal)", minTier: "pro", reason: "Full 8-spectrum multi-sensor array and dual-mode combiner" },
  nesher_neural: { name: "8-Channel Neural BCI & Brainwave Entrainment", minTier: "pro", reason: "Direct EEG sensor acquisition and 5-frequency band classification" },
  ruach_basic: { name: "Ruach AI Text Assistance", minTier: "free", reason: "Basic text queries through Gemini Flash" },
  ruach_voice: { name: "Autonomous Voice & Cross-System Action Engine", minTier: "pro", reason: "Full duplex Speech-to-Text mic, Neural TTS voice, and autonomous UI triggers" },
  kol_recording: { name: "Web Audio Synthesizer Studio & Multi-Track Recorder", minTier: "pro", reason: "Binaural beat oscillator, master volume gain, and real-time WebM audio capture" },
  neshima_chamber: { name: "Hyperbaric Protocol Chamber (ATM Simulation)", minTier: "pro", reason: "Clinical pressure regulation (1.5 - 2.5 ATM) and tissue oxygenation protocols" },
  zpe_casimir: { name: "Zero-Point Energy Casimir Calculator & Vacuum Engine", minTier: "pro", reason: "Quantum vacuum virtual particle visualization and Casimir force physics" },
  daat_pipeline: { name: "DAAT 9-Stage Sovereign Cross-System Execution", minTier: "enterprise", reason: "Unified autonomous execution across all 8 biometric and acoustic nodes" },
  emet_master: { name: "EMET Master Sovereign Control & 1-Click Unification", minTier: "enterprise", reason: "Root-level sovereign override, node synchronization, and full platform diagnostic" },
};

const SOVEREIGN_ADMIN_USER: AuthUser = {
  id: "usr_damone_ward",
  name: "Damone Ward",
  email: "damone.ward@ghostcore.io",
  role: "ADMINISTRATOR",
  tier: "enterprise",
  clearance: "SOVEREIGN",
  licenseKey: "GHOST-SOV-EMET-9999",
  avatar: "DW",
  joinedDate: "October 2024",
};

const EXPLORER_SAMPLE_USER: AuthUser = {
  id: "usr_explorer_demo",
  name: "Guest Explorer",
  email: "explorer@ghostcore.io",
  role: "RESEARCHER",
  tier: "free",
  clearance: "EXPLORER",
  licenseKey: "GHOST-EXP-FREE-0001",
  avatar: "GE",
  joinedDate: "October 2024",
};

const TIER_LEVELS: Record<PlanTier, number> = {
  free: 1,
  pro: 2,
  enterprise: 3,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("ghostcore_auth_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read auth user from localStorage", e);
    }
    // Default to Sovereign Admin so user has immediate access, but they can easily switch to Free to test paywalls!
    return SOVEREIGN_ADMIN_USER;
  });

  const [paywallModal, setPaywallModal] = useState<{
    isOpen: boolean;
    featureKey: FeatureKey | null;
    requiredTier: PlanTier;
    featureName: string;
    reason: string;
  }>({
    isOpen: false,
    featureKey: null,
    requiredTier: "pro",
    featureName: "",
    reason: "",
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("ghostcore_auth_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("ghostcore_auth_user");
      }
    } catch (e) {
      console.warn("Could not save auth user to localStorage", e);
    }
  }, [user]);

  const login = async (email: string, _password?: string) => {
    if (email.toLowerCase().includes("damone") || email.toLowerCase().includes("admin")) {
      setUser(SOVEREIGN_ADMIN_USER);
      return { success: true };
    }
    
    // Standard authenticated user
    const loggedUser: AuthUser = {
      id: `usr_${Date.now().toString(36)}`,
      name: email.split("@")[0].toUpperCase(),
      email,
      role: "RESEARCHER",
      tier: "pro",
      clearance: "RESEARCHER",
      licenseKey: `GHOST-PRO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      avatar: email.substring(0, 2).toUpperCase(),
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };
    setUser(loggedUser);
    return { success: true };
  };

  const loginAsSovereign = () => {
    setUser(SOVEREIGN_ADMIN_USER);
  };

  const register = async (name: string, email: string, _password?: string, plan: PlanTier = "free") => {
    const newUser: AuthUser = {
      id: `usr_${Date.now().toString(36)}`,
      name: name || email.split("@")[0],
      email,
      role: plan === "enterprise" ? "ADMINISTRATOR" : plan === "pro" ? "PRACTITIONER" : "EXPLORER",
      tier: plan,
      clearance: plan === "enterprise" ? "SOVEREIGN" : plan === "pro" ? "RESEARCHER" : "EXPLORER",
      licenseKey: `GHOST-${plan.toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      avatar: (name || email).substring(0, 2).toUpperCase(),
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(EXPLORER_SAMPLE_USER);
  };

  const upgradeTier = (tier: PlanTier, licenseKey?: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tier,
        clearance: tier === "enterprise" ? "SOVEREIGN" : "RESEARCHER",
        role: tier === "enterprise" ? "ADMINISTRATOR" : tier === "pro" ? "PRACTITIONER" : "EXPLORER",
        licenseKey: licenseKey || `GHOST-${tier.toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      };
    });
  };

  const canAccess = (feature: FeatureKey): boolean => {
    if (!user) return false;
    const config = FEATURE_CONFIG[feature];
    if (!config) return true;
    const userLevel = TIER_LEVELS[user.tier] || 1;
    const requiredLevel = TIER_LEVELS[config.minTier] || 1;
    return userLevel >= requiredLevel;
  };

  const getFeatureGate = (feature: FeatureKey) => {
    const config = FEATURE_CONFIG[feature] || {
      name: "Advanced Capability",
      minTier: "pro",
      reason: "Restricted to authorized tiers",
    };
    const allowed = canAccess(feature);
    return {
      allowed,
      requiredTier: config.minTier,
      featureName: config.name,
      reason: config.reason,
    };
  };

  const openPaywall = (featureKey: FeatureKey) => {
    const config = FEATURE_CONFIG[featureKey];
    setPaywallModal({
      isOpen: true,
      featureKey,
      requiredTier: config ? config.minTier : "pro",
      featureName: config ? config.name : "Advanced Sovereign Capability",
      reason: config ? config.reason : "This feature is reserved for Pro and Sovereign members.",
    });
  };

  const closePaywall = () => {
    setPaywallModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginAsSovereign,
        register,
        logout,
        upgradeTier,
        canAccess,
        getFeatureGate,
        openPaywall,
        paywallModal,
        closePaywall,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
