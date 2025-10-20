/**
 * Vendor Badge Component
 *
 * Displays the current EHR vendor (Epic, Cerner, Athena)
 */

'use client';

import { Building2, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useVendor } from '@/hooks/use-vendor-adapter';
import { getVendorDisplayName } from '@/lib/vendor-detection';

export function VendorBadge() {
  const { vendor } = useVendor();

  if (vendor === 'unknown') {
    return null;
  }

  const displayName = getVendorDisplayName(vendor);

  // Vendor-specific colors
  const getBadgeVariant = () => {
    switch (vendor) {
      case 'epic':
        return 'default'; // Blue
      case 'cerner':
        return 'secondary'; // Gray
      case 'athena':
        return 'outline'; // Outlined
      default:
        return 'default';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getBadgeVariant()} className="flex items-center gap-2">
            <Building2 className="h-3 w-3" />
            <span>{displayName}</span>
            <HelpCircle className="h-3 w-3 opacity-50" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Connected to <strong>{displayName}</strong> EHR system
          </p>
          <p className="text-xs text-muted-foreground mt-1">Auto-detected from launch URL</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
