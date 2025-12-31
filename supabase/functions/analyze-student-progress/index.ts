import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student_id } = await req.json();
    
    if (!student_id) {
      return new Response(
        JSON.stringify({ error: 'student_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch lesson feedback for the student
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('lesson_feedback')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      throw new Error('Failed to fetch lesson feedback');
    }

    // Fetch completed lessons count
    const { count: completedLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student_id)
      .eq('status', 'completed');

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      throw new Error('Failed to fetch lessons');
    }

    // If no feedback exists, return default insights
    if (!feedbackData || feedbackData.length === 0) {
      const defaultInsights = {
        overall_score: 50,
        top_weaknesses: ['Nog geen feedback beschikbaar'],
        estimated_lessons_to_exam: 30,
        last_analyzed_at: new Date().toISOString(),
      };

      // Save to user record
      await supabase
        .from('users')
        .update({ ai_insights: defaultInsights })
        .eq('id', student_id);

      return new Response(
        JSON.stringify({ insights: defaultInsights }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for AI analysis
    const feedbackSummary = feedbackData.map(f => ({
      rating: f.rating,
      notes: f.notes,
      topics: f.topics_practiced,
      date: f.created_at,
    }));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI for analysis
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
            content: `Je bent een AI-coach voor rijlessen. Analyseer de voortgang van een leerling op basis van feedback van instructeurs.
            
Je krijgt een array van lesfeedback met ratings (1-5), notities en geoefende onderwerpen.

Geef je analyse terug in het volgende JSON-formaat (ALLEEN JSON, geen andere tekst):
{
  "overall_score": <getal 1-100 gebaseerd op gemiddelde ratings en voortgang>,
  "top_weaknesses": [<array van max 3 verbeterpunten in het Nederlands>],
  "estimated_lessons_to_exam": <geschat aantal lessen tot examen, minimaal 5>
}

Houd rekening met:
- Een rating van 5 is uitstekend, 1 is slecht
- Kijk naar patronen in de topics_practiced
- Analyseer de notities voor specifieke verbeterpunten
- Het gemiddeld aantal lessen tot examen in Nederland is 35-45`
          },
          {
            role: 'user',
            content: `Analyseer deze lesfeedback voor een leerling met ${completedLessons || 0} voltooide lessen:

${JSON.stringify(feedbackSummary, null, 2)}`
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
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No AI response content');
    }

    // Parse AI response
    let insights;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      // Fallback to calculated values
      const avgRating = feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length;
      insights = {
        overall_score: Math.round(avgRating * 20),
        top_weaknesses: ['Verkeersregels', 'Koppeling bediening', 'Spiegels kijken'],
        estimated_lessons_to_exam: Math.max(5, 40 - (completedLessons || 0)),
      };
    }

    // Add timestamp
    insights.last_analyzed_at = new Date().toISOString();

    // Validate and clamp values
    insights.overall_score = Math.max(1, Math.min(100, insights.overall_score || 50));
    insights.estimated_lessons_to_exam = Math.max(5, insights.estimated_lessons_to_exam || 30);
    insights.top_weaknesses = Array.isArray(insights.top_weaknesses) 
      ? insights.top_weaknesses.slice(0, 3) 
      : ['Geen specifieke verbeterpunten'];

    // Save insights to user record
    const { error: updateError } = await supabase
      .from('users')
      .update({ ai_insights: insights })
      .eq('id', student_id);

    if (updateError) {
      console.error('Error saving insights:', updateError);
    }

    console.log('AI insights generated for student:', student_id, insights);

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-student-progress:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
