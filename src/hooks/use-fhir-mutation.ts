/**
 * FHIR Mutation Hooks
 *
 * React Query hooks for FHIR write operations (create, update, delete)
 */

'use client';

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { createFhirResource, updateFhirResource, deleteFhirResource } from '@/lib/fhir-write';
import { useTokenStore } from '@/stores/token-store';
import { useAuth } from './use-auth';
import { storage } from '@/lib/storage';
import type { Resource } from '@medplum/fhirtypes';
import type { WriteResult, WriteOptions } from '@/types/write-operations';

/**
 * Get client IP address (approximation)
 * In production, this should come from the server
 */
function getClientIpAddress(): string {
  // This is a placeholder - in production, get from server
  return '0.0.0.0';
}

/**
 * Hook to create a FHIR resource
 */
export function useCreateFhirResource<T extends Resource>(
  resourceType: string,
  options?: WriteOptions
): UseMutationResult<WriteResult<T>, Error, Omit<T, 'id' | 'meta'>> {
  const queryClient = useQueryClient();
  const token = useTokenStore((state) => state.token);
  const { user } = useAuth();
  const fhirBaseUrl = typeof window !== 'undefined' ? storage.getItem('fhir-base-url') : null;

  return useMutation({
    mutationFn: async (resource: Omit<T, 'id' | 'meta'>) => {
      if (!fhirBaseUrl || !token?.access_token || !user) {
        throw new Error('Missing required authentication');
      }

      return createFhirResource<T>(
        fhirBaseUrl,
        resourceType,
        resource,
        token.access_token,
        {
          userId: user.id,
          userName: user.name || 'Unknown',
          userRole: 'clinician',
          ipAddress: getClientIpAddress(),
          userAgent: navigator.userAgent,
        },
        options
      );
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate related queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['fhir', resourceType] });

        // If there's a patient reference, invalidate patient queries too
        if (result.resource) {
          queryClient.invalidateQueries({ queryKey: ['fhir', 'Patient'] });
        }
      }
    },
  });
}

/**
 * Hook to update a FHIR resource
 */
export function useUpdateFhirResource<T extends Resource>(
  resourceType: string,
  options?: WriteOptions
): UseMutationResult<WriteResult<T>, Error, { resourceId: string; resource: T }> {
  const queryClient = useQueryClient();
  const token = useTokenStore((state) => state.token);
  const { user } = useAuth();
  const fhirBaseUrl = typeof window !== 'undefined' ? storage.getItem('fhir-base-url') : null;

  return useMutation({
    mutationFn: async ({ resourceId, resource }: { resourceId: string; resource: T }) => {
      if (!fhirBaseUrl || !token?.access_token || !user) {
        throw new Error('Missing required authentication');
      }

      return updateFhirResource<T>(
        fhirBaseUrl,
        resourceType,
        resourceId,
        resource,
        token.access_token,
        {
          userId: user.id,
          userName: user.name || 'Unknown',
          userRole: 'clinician',
          ipAddress: getClientIpAddress(),
          userAgent: navigator.userAgent,
        },
        options
      );
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate specific resource and list queries
        queryClient.invalidateQueries({
          queryKey: ['fhir', resourceType, variables.resourceId],
        });
        queryClient.invalidateQueries({ queryKey: ['fhir', resourceType] });
      }
    },
  });
}

/**
 * Hook to delete a FHIR resource
 */
export function useDeleteFhirResource(
  resourceType: string,
  options?: WriteOptions
): UseMutationResult<WriteResult, Error, string> {
  const queryClient = useQueryClient();
  const token = useTokenStore((state) => state.token);
  const { user } = useAuth();
  const fhirBaseUrl = typeof window !== 'undefined' ? storage.getItem('fhir-base-url') : null;

  return useMutation({
    mutationFn: async (resourceId: string) => {
      if (!fhirBaseUrl || !token?.access_token || !user) {
        throw new Error('Missing required authentication');
      }

      return deleteFhirResource(
        fhirBaseUrl,
        resourceType,
        resourceId,
        token.access_token,
        {
          userId: user.id,
          userName: user.name || 'Unknown',
          userRole: 'clinician',
          ipAddress: getClientIpAddress(),
          userAgent: navigator.userAgent,
        },
        options
      );
    },
    onSuccess: (result, resourceId) => {
      if (result.success) {
        // Invalidate specific resource and list queries
        queryClient.invalidateQueries({ queryKey: ['fhir', resourceType, resourceId] });
        queryClient.invalidateQueries({ queryKey: ['fhir', resourceType] });
      }
    },
  });
}
