import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 8);

    console.log(`Auto-complete check at ${currentDate} ${currentTime}`);

    // Find all accepted lessons that have ended (date < today OR (date = today AND end_time < now))
    // We need to calculate end_time = start_time + duration
    const { data: acceptedLessons, error: fetchError } = await supabase
      .from('lessons')
      .select('*')
      .eq('status', 'accepted');

    if (fetchError) {
      console.error('Error fetching lessons:', fetchError);
      throw fetchError;
    }

    if (!acceptedLessons || acceptedLessons.length === 0) {
      console.log('No accepted lessons to check');
      return new Response(
        JSON.stringify({ success: true, completed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${acceptedLessons.length} accepted lessons to check`);

    const lessonsToComplete: string[] = [];

    for (const lesson of acceptedLessons) {
      const lessonDate = lesson.date;
      const [hours, minutes] = lesson.start_time.split(':').map(Number);
      const endMinutes = hours * 60 + minutes + lesson.duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}:00`;

      // Check if lesson has ended
      if (lessonDate < currentDate) {
        // Lesson was on a previous day - mark as completed
        lessonsToComplete.push(lesson.id);
      } else if (lessonDate === currentDate && endTime <= currentTime) {
        // Lesson ended today - mark as completed
        lessonsToComplete.push(lesson.id);
      }
    }

    if (lessonsToComplete.length === 0) {
      console.log('No lessons need to be completed');
      return new Response(
        JSON.stringify({ success: true, completed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Marking ${lessonsToComplete.length} lessons as completed`);

    // Update lessons to completed
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ status: 'completed' })
      .in('id', lessonsToComplete);

    if (updateError) {
      console.error('Error updating lessons:', updateError);
      throw updateError;
    }

    console.log(`✅ Successfully completed ${lessonsToComplete.length} lessons`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        completed: lessonsToComplete.length,
        lessonIds: lessonsToComplete
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-complete-lessons function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});