import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LessonWithAddress {
  id: string;
  start_time: string;
  duration: number;
  student_id: string;
  student_name: string;
  student_address: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instructor_id, date } = await req.json();
    
    if (!instructor_id || !date) {
      return new Response(
        JSON.stringify({ error: 'instructor_id and date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch lessons for the instructor on the given date
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id,
        start_time,
        duration,
        student_id,
        status
      `)
      .eq('instructor_id', instructor_id)
      .eq('date', date)
      .in('status', ['pending', 'accepted'])
      .order('start_time', { ascending: true });

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      throw new Error('Failed to fetch lessons');
    }

    if (!lessonsData || lessonsData.length < 2) {
      return new Response(
        JSON.stringify({ 
          message: 'Need at least 2 lessons to optimize',
          optimized: false,
          lessons_count: lessonsData?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch student addresses
    const studentIds = [...new Set(lessonsData.map(l => l.student_id))];
    const { data: studentsData, error: studentsError } = await supabase
      .from('users')
      .select('id, name, address')
      .in('id', studentIds);

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw new Error('Failed to fetch student data');
    }

    // Create student lookup map
    const studentMap = new Map(studentsData?.map(s => [s.id, s]) || []);

    // Enrich lessons with student data
    const lessonsWithAddresses: LessonWithAddress[] = lessonsData.map(l => ({
      id: l.id,
      start_time: l.start_time,
      duration: l.duration,
      student_id: l.student_id,
      student_name: studentMap.get(l.student_id)?.name || 'Onbekend',
      student_address: studentMap.get(l.student_id)?.address || null,
    }));

    // Check if we have addresses to optimize
    const lessonsWithValidAddresses = lessonsWithAddresses.filter(l => l.student_address);
    
    if (lessonsWithValidAddresses.length < 2) {
      return new Response(
        JSON.stringify({ 
          message: 'Not enough lessons with addresses to optimize',
          optimized: false,
          lessons_without_address: lessonsWithAddresses.filter(l => !l.student_address).map(l => l.student_name)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use AI to determine optimal route order
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Je bent een route-optimalisatie expert voor rijscholen in Nederland.
            
Gegeven een lijst van lessen met adressen, bepaal de meest efficiënte volgorde om reistijd te minimaliseren.

Geef je antwoord terug in het volgende JSON-formaat (ALLEEN JSON, geen andere tekst):
{
  "optimized_order": [<array van lesson IDs in optimale volgorde>],
  "estimated_savings_km": <geschatte besparing in kilometers>,
  "reasoning": "<korte uitleg in het Nederlands>"
}

Let op:
- Begin bij het eerste adres en optimaliseer de route
- Houd rekening met typische reistijden in Nederland
- Prioriteer het minimaliseren van totale reisafstand`
          },
          {
            role: 'user',
            content: `Optimaliseer de route voor deze rijlessen:

${lessonsWithValidAddresses.map((l, i) => `${i + 1}. ID: ${l.id}\n   Leerling: ${l.student_name}\n   Adres: ${l.student_address}\n   Huidige tijd: ${l.start_time}\n   Duur: ${l.duration} minuten`).join('\n\n')}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI optimization failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No AI response content');
    }

    // Parse AI response
    let optimization;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimization = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      // Fallback: keep original order
      return new Response(
        JSON.stringify({ 
          message: 'Could not parse optimization result',
          optimized: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate optimized order contains valid lesson IDs
    const validLessonIds = new Set(lessonsWithValidAddresses.map(l => l.id));
    const optimizedOrder = optimization.optimized_order?.filter((id: string) => validLessonIds.has(id)) || [];

    if (optimizedOrder.length !== lessonsWithValidAddresses.length) {
      console.error('Invalid optimization result:', optimization);
      return new Response(
        JSON.stringify({ 
          message: 'Invalid optimization result',
          optimized: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate new start times based on optimized order
    // Start from the earliest existing start time
    const sortedByTime = [...lessonsWithValidAddresses].sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );
    let currentTime = sortedByTime[0].start_time;

    const updates: { id: string; start_time: string }[] = [];
    
    for (const lessonId of optimizedOrder) {
      const lesson = lessonsWithValidAddresses.find(l => l.id === lessonId);
      if (lesson) {
        updates.push({
          id: lessonId,
          start_time: currentTime,
        });
        
        // Add duration + 15 min travel buffer for next lesson
        const [hours, minutes] = currentTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + lesson.duration + 15;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:00`;
      }
    }

    // Update lessons in database
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ start_time: update.start_time })
        .eq('id', update.id);

      if (updateError) {
        console.error('Error updating lesson:', update.id, updateError);
      }
    }

    console.log('Route optimized for instructor:', instructor_id, 'on', date);
    console.log('Updates:', updates);

    return new Response(
      JSON.stringify({
        optimized: true,
        estimated_savings_km: optimization.estimated_savings_km || 5,
        reasoning: optimization.reasoning || 'Route geoptimaliseerd op basis van locaties',
        updates: updates.map(u => ({
          ...u,
          student_name: lessonsWithValidAddresses.find(l => l.id === u.id)?.student_name
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in optimize-driving-route:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
