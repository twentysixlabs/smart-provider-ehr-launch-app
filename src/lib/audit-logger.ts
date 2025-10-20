/**
 * Audit Logger
 *
 * Logs all PHI access and write operations for HIPAA compliance
 * Uses Axiom for centralized logging (can be replaced with any logging service)
 */

import type { AuditLogEntry } from '@/types/write-operations';

/**
 * Log PHI access or write operation
 *
 * HIPAA requires logging:
 * - Who accessed the data (user ID, name, role)
 * - What data was accessed (patient ID, resource type)
 * - When it was accessed (timestamp)
 * - Where from (IP address, user agent)
 * - What action was taken (read, write, delete)
 */
export async function logPHIAccess(entry: AuditLogEntry): Promise<void> {
  // In production, this should send to Axiom or your logging service
  // For now, we'll log to console and localStorage for development

  const logEntry = {
    ...entry,
    timestamp: entry.timestamp.toISOString(),
    environment: process.env.NODE_ENV,
  };

  // Development: Log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT LOG]', logEntry);
  }

  // Store in localStorage for demonstration (in production, use Axiom)
  try {
    const existingLogs = getAuditLogs();
    existingLogs.push(logEntry);

    // Keep only last 100 logs in localStorage (prevent overflow)
    const recentLogs = existingLogs.slice(-100);

    if (typeof window !== 'undefined') {
      localStorage.setItem('audit-logs', JSON.stringify(recentLogs));
    }
  } catch (error) {
    console.error('Failed to store audit log:', error);
  }

  // TODO: Send to Axiom in production
  // await sendToAxiom(logEntry);
}

/**
 * Send audit log to Axiom (production implementation)
 */
async function sendToAxiom(entry: AuditLogEntry & { timestamp: string }): Promise<void> {
  // TODO: Implement Axiom integration
  // const axiomApiKey = process.env.AXIOM_API_KEY;
  // const axiomDataset = process.env.AXIOM_DATASET || 'phi-access-logs';
  //
  // if (!axiomApiKey) {
  //   console.warn('AXIOM_API_KEY not set, skipping Axiom logging');
  //   return;
  // }
  //
  // await fetch('https://api.axiom.co/v1/datasets/' + axiomDataset + '/ingest', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${axiomApiKey}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify([entry]),
  // });
}

/**
 * Get audit logs from localStorage (development only)
 */
export function getAuditLogs(): (AuditLogEntry & { timestamp: string; environment?: string })[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const logs = localStorage.getItem('audit-logs');
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
}

/**
 * Clear audit logs (development only)
 */
export function clearAuditLogs(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('audit-logs');
  }
}

/**
 * Get audit logs for a specific patient
 */
export function getPatientAuditLogs(
  patientId: string
): (AuditLogEntry & { timestamp: string; environment?: string })[] {
  const allLogs = getAuditLogs();
  return allLogs.filter((log) => log.patientId === patientId);
}

/**
 * Get audit logs for a specific user
 */
export function getUserAuditLogs(
  userId: string
): (AuditLogEntry & { timestamp: string; environment?: string })[] {
  const allLogs = getAuditLogs();
  return allLogs.filter((log) => log.userId === userId);
}

/**
 * Get write operation audit logs
 */
export function getWriteAuditLogs(): (AuditLogEntry & {
  timestamp: string;
  environment?: string;
})[] {
  const allLogs = getAuditLogs();
  return allLogs.filter((log) => log.action === 'write' || log.action === 'delete');
}
