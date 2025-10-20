/**
 * Clinical Note Editor
 *
 * Component for creating clinical notes (DocumentReference resources)
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { DocumentReference } from '@medplum/fhirtypes';
import { AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCreateFhirResource } from '@/hooks/use-fhir-mutation';
import { useVendor } from '@/hooks/use-vendor-adapter';
import { useTokenStore } from '@/stores/token-store';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  content: z.string().min(10, 'Note content must be at least 10 characters'),
  category: z.enum(['progress-note', 'consultation', 'discharge-summary', 'history-and-physical']),
  status: z.enum(['preliminary', 'final']),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteEditorProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NoteEditor({ onSuccess, onCancel }: NoteEditorProps) {
  const token = useTokenStore((state) => state.token);
  const { vendor, adapter } = useVendor();
  const createNote = useCreateFhirResource<DocumentReference>('DocumentReference');
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      status: 'final',
      category: 'progress-note',
    },
  });

  // Check if vendor supports DocumentReference writes
  const supportsWrites = adapter?.supportsWrite('DocumentReference') ?? false;

  const onSubmit = async (data: NoteFormData) => {
    if (!token?.patient) {
      alert('No patient context available. Please launch from EHR.');
      return;
    }

    // Build FHIR DocumentReference resource
    const documentReference: Omit<DocumentReference, 'id' | 'meta'> = {
      resourceType: 'DocumentReference',
      status: data.status === 'final' ? 'current' : 'entered-in-error',
      type: {
        coding: [
          {
            system: 'http://loinc.org',
            code: getCategoryCode(data.category),
            display: getCategoryDisplay(data.category),
          },
        ],
        text: getCategoryDisplay(data.category),
      },
      subject: {
        reference: `Patient/${token.patient}`,
      },
      date: new Date().toISOString(),
      author: [
        {
          reference: token.fhirUser || `Practitioner/${token.resource || 'unknown'}`,
        },
      ],
      description: data.title,
      content: [
        {
          attachment: {
            contentType: 'text/plain',
            data: btoa(data.content), // Base64 encode
            title: data.title,
            creation: new Date().toISOString(),
          },
        },
      ],
    };

    const result = await createNote.mutateAsync(documentReference);

    if (result.success) {
      setShowSuccess(true);
      reset();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 3000);
    }
  };

  if (!supportsWrites) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Clinical Note Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Write operations are not supported for {vendor} in this configuration.
              {vendor === 'epic' &&
                ' DocumentReference writes require additional Epic certification.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Clinical Note Editor
        </CardTitle>
        <CardDescription>
          Create a clinical note that will be saved to the patient's chart in{' '}
          {vendor === 'epic' ? 'Epic' : vendor === 'cerner' ? 'Cerner' : 'Athena'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Clinical note saved successfully to EHR!
            </AlertDescription>
          </Alert>
        )}

        {createNote.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to save note: {createNote.error.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Note Title *</Label>
            <input
              id="title"
              {...register('title')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Progress Note - 2025-01-20"
              disabled={createNote.isPending}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Note Type *</Label>
              <select
                id="category"
                {...register('category')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={createNote.isPending}
              >
                <option value="progress-note">Progress Note</option>
                <option value="consultation">Consultation</option>
                <option value="discharge-summary">Discharge Summary</option>
                <option value="history-and-physical">History and Physical</option>
              </select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                {...register('status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={createNote.isPending}
              >
                <option value="preliminary">Preliminary (Draft)</option>
                <option value="final">Final (Complete)</option>
              </select>
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Note Content *</Label>
            <textarea
              id="content"
              {...register('content')}
              rows={12}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter clinical note content...

Example:
Patient presents for follow-up visit. Reviewed medications and discussed treatment plan. Patient reports improved symptoms. Continue current medications. Follow-up in 4 weeks."
              disabled={createNote.isPending}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={createNote.isPending} className="flex-1">
              {createNote.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving to EHR...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Save Note to EHR
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createNote.isPending}
              >
                Cancel
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            * This action will create a clinical note in the patient's chart. All writes are logged
            for audit compliance.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Get LOINC code for note category
 */
function getCategoryCode(category: string): string {
  switch (category) {
    case 'progress-note':
      return '11506-3';
    case 'consultation':
      return '11488-4';
    case 'discharge-summary':
      return '18842-5';
    case 'history-and-physical':
      return '34117-2';
    default:
      return '11506-3';
  }
}

/**
 * Get display text for note category
 */
function getCategoryDisplay(category: string): string {
  switch (category) {
    case 'progress-note':
      return 'Progress Note';
    case 'consultation':
      return 'Consultation Note';
    case 'discharge-summary':
      return 'Discharge Summary';
    case 'history-and-physical':
      return 'History and Physical';
    default:
      return 'Clinical Note';
  }
}
