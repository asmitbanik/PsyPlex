import { supabase, DbResponse } from './supabaseClient';

export type TranscriptSegment = {
  id: string;
  transcript_id: string;
  speaker: 'Therapist' | 'Client';
  text: string;
  timestamp_start: number;
  timestamp_end?: number;
  created_at?: string;
  updated_at?: string;
};

export type TranscriptSegmentInput = Omit<TranscriptSegment, 'id' | 'created_at' | 'updated_at'>;

/**
 * Adds a segment to a transcript
 * @param segmentData The segment data to create
 * @returns The created transcript segment or an error
 */
export async function createTranscriptSegment(
  segmentData: TranscriptSegmentInput
): Promise<DbResponse<TranscriptSegment>> {
  try {
    const { data, error } = await supabase
      .from('transcript_segments')
      .insert(segmentData)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating transcript segment:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific transcript segment
 * @param segmentId UUID of the segment
 * @returns The transcript segment or an error
 */
export async function getTranscriptSegmentById(segmentId: string): Promise<DbResponse<TranscriptSegment>> {
  try {
    const { data, error } = await supabase
      .from('transcript_segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transcript segment:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all segments for a specific transcript
 * @param transcriptId UUID of the transcript
 * @returns Array of transcript segment objects or an error
 */
export async function getTranscriptSegmentsByTranscriptId(
  transcriptId: string
): Promise<DbResponse<TranscriptSegment[]>> {
  try {
    const { data, error } = await supabase
      .from('transcript_segments')
      .select('*')
      .eq('transcript_id', transcriptId)
      .order('timestamp_start', { ascending: true });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transcript segments by transcript ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates a transcript segment
 * @param segmentId UUID of the transcript segment
 * @param updateData Partial segment data to update
 * @returns The updated transcript segment or an error
 */
export async function updateTranscriptSegment(
  segmentId: string, 
  updateData: Partial<TranscriptSegmentInput>
): Promise<DbResponse<TranscriptSegment>> {
  try {
    const { data, error } = await supabase
      .from('transcript_segments')
      .update(updateData)
      .eq('id', segmentId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating transcript segment:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a transcript segment
 * @param segmentId UUID of the transcript segment
 * @returns Success status or an error
 */
export async function deleteTranscriptSegment(
  segmentId: string
): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('transcript_segments')
      .delete()
      .eq('id', segmentId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting transcript segment:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Create multiple transcript segments in bulk
 * @param segments Array of segment data to create
 * @returns Created transcript segments or an error
 */
export async function createTranscriptSegments(
  segments: TranscriptSegmentInput[]
): Promise<DbResponse<TranscriptSegment[]>> {
  try {
    const { data, error } = await supabase
      .from('transcript_segments')
      .insert(segments)
      .select();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating transcript segments in bulk:', error);
    return { data: null, error: error as Error };
  }
}
