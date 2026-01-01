import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tool definitions for the AI
const tools = [
  {
    type: "function",
    function: {
      name: "get_instructors",
      description: "Haal de lijst van beschikbare instructeurs op voor de rijschool.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_available_times",
      description: "Haal beschikbare tijdslots op voor een instructeur op een specifieke datum.",
      parameters: {
        type: "object",
        properties: {
          instructor_id: { type: "string", description: "UUID van de instructeur" },
          date: { type: "string", description: "Datum in YYYY-MM-DD formaat" },
          duration: { type: "number", description: "Duur van de les in minuten (60, 90, of 120)", default: 60 }
        },
        required: ["instructor_id", "date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "book_lesson",
      description: "Boek een rijles voor de leerling. Controleert automatisch beschikbaarheid en credits.",
      parameters: {
        type: "object",
        properties: {
          instructor_id: { type: "string", description: "UUID van de instructeur" },
          date: { type: "string", description: "Datum in YYYY-MM-DD formaat" },
          start_time: { type: "string", description: "Starttijd in HH:MM formaat (bijv. 09:00)" },
          duration: { type: "number", description: "Duur in minuten (60, 90, of 120)", default: 60 },
          remarks: { type: "string", description: "Optionele opmerkingen" }
        },
        required: ["instructor_id", "date", "start_time"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_my_lessons",
      description: "Haal de lessen van de leerling op (aankomende en recente).",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["pending", "accepted", "cancelled", "completed", "all"], description: "Filter op status" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cancel_lesson",
      description: "Annuleer een geboekte les. Volgt de 24-uurs regel voor credit teruggave.",
      parameters: {
        type: "object",
        properties: {
          lesson_id: { type: "string", description: "UUID van de les om te annuleren" }
        },
        required: ["lesson_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_credits",
      description: "Haal het huidige creditsaldo van de leerling op.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  }
];

// Execute tool calls
async function executeTool(
  supabase: any,
  userId: string,
  tenantId: string,
  toolName: string,
  args: any
): Promise<string> {
  console.log(`Executing tool: ${toolName}`, args);

  switch (toolName) {
    case "get_instructors": {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .eq('role', 'instructor');
      
      if (error) return `Fout: ${error.message}`;
      return JSON.stringify(data.map((i: any) => ({ id: i.id, name: i.name })));
    }

    case "get_available_times": {
      const { instructor_id, date, duration = 60 } = args;
      
      // Get existing lessons
      const { data: lessons } = await supabase
        .from('lessons')
        .select('start_time, duration')
        .eq('instructor_id', instructor_id)
        .eq('date', date)
        .neq('status', 'cancelled');
      
      // Get unavailability
      const { data: unavail } = await supabase
        .from('instructor_availability')
        .select('start_time, end_time')
        .eq('instructor_id', instructor_id)
        .eq('date', date);
      
      const availableTimes = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
      
      const available = availableTimes.filter(time => {
        const [h, m] = time.split(':').map(Number);
        const slotStart = h * 60 + m;
        const slotEnd = slotStart + duration;
        
        // Check lessons
        for (const l of (lessons || [])) {
          const [lh, lm] = l.start_time.split(':').map(Number);
          const lessonStart = lh * 60 + lm;
          const lessonEnd = lessonStart + l.duration;
          if (slotStart < lessonEnd && slotEnd > lessonStart) return false;
        }
        
        // Check unavailability
        for (const u of (unavail || [])) {
          const [ush, usm] = u.start_time.split(':').map(Number);
          const [ueh, uem] = u.end_time.split(':').map(Number);
          const unavailStart = ush * 60 + usm;
          const unavailEnd = ueh * 60 + uem;
          if (slotStart < unavailEnd && slotEnd > unavailStart) return false;
        }
        
        return true;
      });
      
      if (available.length === 0) {
        return `Geen beschikbare tijden op ${date}`;
      }
      return `Beschikbare tijden op ${date}: ${available.join(', ')}`;
    }

    case "book_lesson": {
      const { instructor_id, date, start_time, duration = 60, remarks } = args;
      
      // Check credits
      const { data: credits } = await supabase
        .from('lesson_credits')
        .select('total_credits, used_credits')
        .eq('student_id', userId)
        .single();
      
      const available = credits ? credits.total_credits - credits.used_credits : 0;
      if (available < 1) {
        return "Je hebt niet genoeg credits om een les te boeken. Neem contact op met je rijschool.";
      }
      
      // Insert lesson
      const { data: lesson, error } = await supabase
        .from('lessons')
        .insert({
          tenant_id: tenantId,
          instructor_id,
          student_id: userId,
          date,
          start_time,
          duration,
          status: 'pending',
          created_by: userId,
          remarks: remarks || null
        })
        .select()
        .single();
      
      if (error) {
        if (error.message.includes('INSTRUCTOR_UNAVAILABLE')) {
          return "De instructeur is niet beschikbaar op dit moment. Kies een andere tijd.";
        }
        return `Kon les niet boeken: ${error.message}`;
      }
      
      // Get instructor name
      const { data: instructor } = await supabase
        .from('users')
        .select('name')
        .eq('id', instructor_id)
        .single();
      
      return `✅ Lesverzoek verzonden! Datum: ${date}, Tijd: ${start_time}, Duur: ${duration} minuten, Instructeur: ${instructor?.name || 'onbekend'}. De instructeur ontvangt een melding en kan het verzoek accepteren.`;
    }

    case "get_my_lessons": {
      const { status } = args;
      
      let query = supabase
        .from('lessons')
        .select('id, date, start_time, duration, status, remarks, instructor:instructor_id(name)')
        .eq('student_id', userId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(10);
      
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) return `Fout: ${error.message}`;
      if (!data || data.length === 0) return "Je hebt nog geen lessen.";
      
      const lessonList = data.map((l: any) => 
        `- ${l.date} ${l.start_time} (${l.duration} min) - ${l.status} - Instructeur: ${l.instructor?.name || 'onbekend'}${l.id ? ` [ID: ${l.id}]` : ''}`
      ).join('\n');
      
      return `Je lessen:\n${lessonList}`;
    }

    case "cancel_lesson": {
      const { lesson_id } = args;
      
      // Get lesson details
      const { data: lesson, error: fetchError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lesson_id)
        .eq('student_id', userId)
        .single();
      
      if (fetchError || !lesson) {
        return "Les niet gevonden of je hebt geen toegang tot deze les.";
      }
      
      if (lesson.status === 'cancelled') {
        return "Deze les is al geannuleerd.";
      }
      
      if (lesson.status === 'completed') {
        return "Je kunt een voltooide les niet annuleren.";
      }
      
      // Check 24-hour rule
      const lessonDateTime = new Date(`${lesson.date}T${lesson.start_time}`);
      const now = new Date();
      const hoursUntilLesson = (lessonDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // Update lesson status
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ status: 'cancelled' })
        .eq('id', lesson_id);
      
      if (updateError) {
        return `Kon les niet annuleren: ${updateError.message}`;
      }
      
      if (hoursUntilLesson > 24) {
        return `✅ Les geannuleerd. Omdat je meer dan 24 uur van tevoren annuleert, worden je credits automatisch teruggestort.`;
      } else {
        return `✅ Les geannuleerd. Let op: omdat je binnen 24 uur voor de les annuleert, is het aan de instructeur of je credits worden teruggestort.`;
      }
    }

    case "get_credits": {
      const { data: credits } = await supabase
        .from('lesson_credits')
        .select('total_credits, used_credits')
        .eq('student_id', userId)
        .single();
      
      if (!credits) return "Je hebt nog geen credits. Neem contact op met je rijschool.";
      
      const available = credits.total_credits - credits.used_credits;
      return `Je hebt ${available} beschikbare credits (${credits.used_credits} gebruikt van ${credits.total_credits} totaal).`;
    }

    default:
      return `Onbekende tool: ${toolName}`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, user_id, tenant_id } = await req.json();
    
    if (!user_id || !tenant_id) {
      return new Response(
        JSON.stringify({ error: 'user_id en tenant_id zijn vereist' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const systemPrompt = `Je bent een vriendelijke AI-assistent voor een rijschool app genaamd RijPlanner.

Je kunt de volgende acties uitvoeren voor leerlingen:
- Lessen boeken (check eerst beschikbaarheid)
- Lessen annuleren
- Beschikbare tijden opvragen
- Instructeurs tonen
- Credits bekijken
- Lessen overzicht geven

Belangrijke regels:
1. Vraag ALTIJD eerst om bevestiging voordat je een les boekt of annuleert
2. Check altijd eerst de beschikbare tijden voordat je een les probeert te boeken
3. Wees duidelijk over de 24-uurs annuleringsregel (annuleren binnen 24 uur = mogelijk geen credit terug)
4. Als je een les moet annuleren, vraag eerst naar welke les en bevestig de details

Antwoord altijd in het Nederlands, wees behulpzaam en geef praktische adviezen.
Houd je antwoorden beknopt maar informatief.`;

    let currentMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Call AI with tools
    let response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: currentMessages,
        tools,
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Te veel verzoeken, probeer het later opnieuw.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Betaling vereist, voeg credits toe aan je Lovable workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI service niet beschikbaar');
    }

    let data = await response.json();
    let assistantMessage = data.choices?.[0]?.message;

    // Process tool calls in a loop
    let iterations = 0;
    const maxIterations = 5;

    while (assistantMessage?.tool_calls && iterations < maxIterations) {
      iterations++;
      console.log(`Processing tool calls, iteration ${iterations}`);

      const toolResults = [];
      for (const toolCall of assistantMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments || '{}');
        const result = await executeTool(supabase, user_id, tenant_id, toolCall.function.name, args);
        toolResults.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result
        });
      }

      // Add assistant message and tool results
      currentMessages.push(assistantMessage);
      currentMessages.push(...toolResults);

      // Call AI again with tool results
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: currentMessages,
          tools,
          tool_choice: 'auto',
        }),
      });

      if (!response.ok) {
        throw new Error('AI service niet beschikbaar');
      }

      data = await response.json();
      assistantMessage = data.choices?.[0]?.message;
    }

    const content = assistantMessage?.content || 'Sorry, ik kon geen antwoord genereren.';

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Onbekende fout' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
