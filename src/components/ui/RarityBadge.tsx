"use client";

import { motion } from "motion/react";
import { getRarityConfig, isHitRarity, hasAnimation } from "@/lib/rarity-utils";

interface RarityBadgeProps {
  rarity: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function RarityBadge({ 
  rarity, 
  size = "sm", 
  showLabel = true,
  className = "" 
}: RarityBadgeProps) {
  const config = getRarityConfig(rarity);
  const animated = hasAnimation(rarity);

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-1
    rounded-md font-semibold tracking-wide
    ${config.bgColor} ${config.borderColor} border
    ${config.glowColor ? `shadow-lg ${config.glowColor}` : ''}
    ${sizeClasses[size]}
    ${className}
  `;

  // Animated glow effect for rare cards
  const glowAnimation = animated ? {
    animate: { 
      boxShadow: [
        `0 0 5px rgba(255,255,255,0.3)`,
        `0 0 15px rgba(255,255,255,0.5)`,
        `0 0 5px rgba(255,255,255,0.3)`,
      ]
    },
    transition: { duration: 2, repeat: Infinity }
  } : {};

  if (animated) {
    return (
      <motion.span 
        className={baseClasses}
        {...glowAnimation}
      >
        <span className={config.color}>
          {config.symbol}
        </span>
        {showLabel && (
          <span className={`${config.color} uppercase tracking-wider`}>
            {config.label}
          </span>
        )}
      </motion.span>
    );
  }

  return (
    <span className={baseClasses}>
      <span className={config.color}>
        {config.symbol}
      </span>
      {showLabel && (
        <span className={`${config.color} uppercase tracking-wider`}>
          {config.label}
        </span>
      )}
    </span>
  );
}

// Compact version showing only the symbol
export function RaritySymbol({ 
  rarity, 
  size = "md",
  className = "" 
}: { 
  rarity: string; 
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const config = getRarityConfig(rarity);
  const animated = hasAnimation(rarity);

  const sizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  if (animated) {
    return (
      <motion.span 
        className={`${config.color} ${sizeClasses[size]} ${className}`}
        animate={{ 
          textShadow: [
            `0 0 5px currentColor`,
            `0 0 10px currentColor`,
            `0 0 5px currentColor`,
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {config.symbol}
      </motion.span>
    );
  }

  return (
    <span className={`${config.color} ${sizeClasses[size]} ${className}`}>
      {config.symbol}
    </span>
  );
}

// Full rarity display with symbol and name
export function RarityDisplay({ 
  rarity,
  size = "md",
  className = "" 
}: { 
  rarity: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const config = getRarityConfig(rarity);

  const sizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <RaritySymbol rarity={rarity} size={size} />
      <span className={`${config.color} ${sizeClasses[size]} uppercase tracking-wider font-semibold`}>
        {config.label}
      </span>
    </div>
  );
}

// Card border glow effect based on rarity
export function RarityGlow({ 
  rarity,
  children,
  className = ""
}: { 
  rarity: string;
  children: React.ReactNode;
  className?: string;
}) {
  const config = getRarityConfig(rarity);
  const isHit = isHitRarity(rarity);
  const animated = hasAnimation(rarity);

  if (!isHit) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ boxShadow: `0 0 10px rgba(255,255,255,0.2)` }}
      animate={animated ? {
        boxShadow: [
          `0 0 10px rgba(255,255,255,0.2)`,
          `0 0 25px rgba(255,255,255,0.4)`,
          `0 0 10px rgba(255,255,255,0.2)`,
        ]
      } : {}}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}
