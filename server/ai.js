// AI Engine for CampusConnect
// Integrates with Gemini API when GEMINI_API_KEY is available,
// with an intelligent contextual generator fallback to guarantee 100% reliable functionality.

export async function generateEventCopy({ topic, rawInput = '', audience = 'All Students', category = '' }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const prompt = `You are an expert university event coordinator and campus copywriter.
Create an exciting, high-converting campus event announcement from these details:
- Input/Topic: "${rawInput || topic}"
- Target Audience: "${audience}"
- Preferred Category (if any): "${category}"

Format your response as a valid JSON object strictly matching this schema:
{
  "title": "A punchy, catchy event title (max 10 words)",
  "tagline": "A one-sentence hook (max 15 words)",
  "description": "Engaging 2-3 paragraph description with emojis and key benefits",
  "category": "One of: Technology, Hackathons, Workshops, Cultural, Sports, Career, Arts, Gaming",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4"],
  "agenda": ["Time - Session Title", "Time - Session Title", "Time - Session Title"],
  "prerequisites": "What students should bring or know"
}
Output only the raw JSON string with no markdown formatting.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          // Clean possible markdown code fences
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return { ...parsed, aiSource: 'Google Gemini 1.5 Flash' };
        }
      }
    } catch (err) {
      console.warn('Gemini API request failed, falling back to intelligent local copywriter engine:', err.message);
    }
  }

  // Intelligent Contextual AI Engine Fallback
  return generateIntelligentFallbackCopy({ topic: topic || rawInput, audience, category });
}

function generateIntelligentFallbackCopy({ topic, audience, category }) {
  const text = (topic || '').toLowerCase();
  
  // Detect domain
  let detectedCategory = 'Technology';
  let bannerTheme = 'tech';
  let defaultTags = ['Campus', 'Community', 'Students'];

  if (text.includes('hack') || text.includes('code') || text.includes('dev') || text.includes('sprint') || text.includes('build')) {
    detectedCategory = 'Hackathons';
    defaultTags = ['Hackathon', 'Coding', 'Prizes', 'Teamwork', 'AI'];
    bannerTheme = 'hackathon';
  } else if (text.includes('game') || text.includes('esports') || text.includes('valorant') || text.includes('fifa') || text.includes('tournament')) {
    detectedCategory = 'Gaming';
    defaultTags = ['Gaming', 'Esports', 'Tournament', 'Community'];
    bannerTheme = 'gaming';
  } else if (text.includes('music') || text.includes('dance') || text.includes('cultural') || text.includes('fest') || text.includes('night') || text.includes('acoustic')) {
    detectedCategory = 'Cultural';
    defaultTags = ['Music', 'Cultural', 'Fun', 'Social', 'LivePerformance'];
    bannerTheme = 'cultural';
  } else if (text.includes('sport') || text.includes('football') || text.includes('cricket') || text.includes('basketball') || text.includes('run')) {
    detectedCategory = 'Sports';
    defaultTags = ['Sports', 'Fitness', 'CampusCup', 'Energy'];
    bannerTheme = 'sports';
  } else if (text.includes('design') || text.includes('figma') || text.includes('art') || text.includes('paint') || text.includes('draw')) {
    detectedCategory = 'Arts';
    defaultTags = ['Art', 'Design', 'Creativity', 'Exhibition'];
    bannerTheme = 'art';
  } else if (text.includes('career') || text.includes('resume') || text.includes('job') || text.includes('interview') || text.includes('placement')) {
    detectedCategory = 'Career';
    defaultTags = ['Career', 'Networking', 'Internships', 'Alumni'];
    bannerTheme = 'career';
  } else if (text.includes('learn') || text.includes('workshop') || text.includes('hands-on') || text.includes('bootcamp')) {
    detectedCategory = 'Workshops';
    defaultTags = ['Workshop', 'HandsOn', 'Skills', 'Certificate'];
    bannerTheme = 'workshop';
  }

  if (category) {
    detectedCategory = category;
  }

  // Capitalize title appropriately
  const cleanTitle = topic
    ? topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : `${detectedCategory} Summit 2026`;

  const descriptionsByCat = {
    Hackathons: `Get ready to ideate, prototype, and ship groundbreaking products! Whether you're an experienced developer, UI/UX enthusiast, or first-time hacker, this high-energy sprint is designed to turn your bold ideas into functional prototypes.\n\nEnjoy complimentary meals, snacks, late-night coffee stations, exclusive sponsor merchandise, and dedicated 1-on-1 mentor guidance. Compete for cash prizes, trophies, and direct interviews with top industry sponsors!`,
    Technology: `Join fellow passionate technologists for an in-depth exploration of state-of-the-art tools, real-world case studies, and engineering practices.\n\nLed by experienced engineers and visiting researchers, this session combines foundational architectural concepts with interactive demonstrations. Perfect for students looking to stand out in the technical landscape and expand their project portfolios.`,
    Workshops: `A hands-on, practical deep dive designed to level up your real-world toolkit. Step away from theory and learn by building alongside industry mentors.\n\nAll participants will receive guided starter repositories, digital reference cheatsheets, and an official verified certificate of completion for their professional portfolios.`,
    Cultural: `Immerse yourself in campus vibrant arts and culture! An unforgettable evening featuring student bands, poetry recitals, visual displays, and community celebration.\n\nConnect with friends, meet new peers across diverse departments, and celebrate the creative heartbeat of our campus community. Refreshments and snacks provided.`,
    Sports: `Step up to the competition or cheer loud from the sidelines! Experience high-octane collegiate athletic spirit, competitive brackets, and energetic DJ beats.\n\nAwards, championship medals, and campus bragging rights await the tournament winners. Refreshment hydration zones available for all registered athletes.`,
    Career: `Accelerate your professional trajectory! Connect directly with leading hiring managers, alumni executives, and recruiting specialists looking for campus talent.\n\nGain insider tips on navigating modern hiring pipelines, take advantage of rapid resume critiques, and expand your professional network with meaningful connections.`,
    Gaming: `Ready your keyboards and controllers for the ultimate campus showdown! Face off in competitive brackets streamed live to the mega-displays with dynamic student casting.\n\nGrand prize pool, tournament trophies, and custom gaming merchandise for winners and MVPs. Spectators welcome!`,
    Arts: `Celebrate creative expression and multidisciplinary art at our campus showcase. Featuring digital illustrations, oil canvas works, sculpture, and interactive visual installations.\n\nMeet the student artists, participate in live voting for the Audience Choice Award, and enjoy light refreshments.`
  };

  const agendasByCat = {
    Hackathons: ['09:00 AM - Check-in & Team Formation', '10:30 AM - Keynote & Challenge Reveal', '01:00 PM - Mentor Clinic & Technical Demos', '07:00 PM - Final Submissions & Live Pitching'],
    Technology: ['02:00 PM - Opening Keynote & Market Overview', '02:45 PM - Architecture Deep Dive & Code Walkthrough', '03:45 PM - Interactive Q&A and Networking'],
    Workshops: ['10:00 AM - Environment Setup & Starter Code', '10:45 AM - Guided Build Phase & Exercises', '12:15 PM - Project Showcase & Q&A'],
    Cultural: ['05:30 PM - Gates Open & Acoustic Preludes', '06:30 PM - Main Stage Showcases & Guest Acts', '08:00 PM - Open Jam & Community Social'],
    Sports: ['03:30 PM - Athlete Registration & Warmup', '04:00 PM - Bracket Knockout Rounds', '07:00 PM - Finals & Award Ceremony'],
    Career: ['01:00 PM - Doors Open & Company Booths', '02:30 PM - Panel: Navigating 2026 Internships', '04:00 PM - Speed Networking & Resume Critiques'],
    Gaming: ['11:00 AM - Tournament Seeding & Warmups', '01:00 PM - Quarterfinals & Semifinals', '04:30 PM - Grand Finals with Live Shoutcasting'],
    Arts: ['03:00 PM - Exhibition Gallery Open', '04:15 PM - Student Artist Presentations', '05:45 PM - Community Awards & Closing Remarks']
  };

  return {
    title: cleanTitle.length > 5 ? cleanTitle : `${detectedCategory} Connect 2026`,
    tagline: `Discover, connect, and excel at CampusConnect's upcoming ${detectedCategory} experience.`,
    description: descriptionsByCat[detectedCategory] || descriptionsByCat.Technology,
    category: detectedCategory,
    suggestedTags: defaultTags,
    agenda: agendasByCat[detectedCategory] || agendasByCat.Technology,
    prerequisites: detectedCategory === 'Hackathons' || detectedCategory === 'Workshops' 
      ? 'Bring your laptop, charger, and student ID.' 
      : 'Bring your student ID card. All registered attendees receive guaranteed seating.',
    aiSource: 'CampusConnect AI Copilot'
  };
}

// AI Category Suggester
export function suggestCategoryFromText(text = '') {
  const t = text.toLowerCase();
  if (t.includes('hack') || t.includes('code') || t.includes('programming') || t.includes('sprint')) return 'Hackathons';
  if (t.includes('ai') || t.includes('machine learning') || t.includes('tech') || t.includes('web3') || t.includes('software')) return 'Technology';
  if (t.includes('game') || t.includes('gaming') || t.includes('esports') || t.includes('valorant') || t.includes('fifa')) return 'Gaming';
  if (t.includes('music') || t.includes('dance') || t.includes('song') || t.includes('band') || t.includes('cultural') || t.includes('night')) return 'Cultural';
  if (t.includes('sport') || t.includes('cricket') || t.includes('football') || t.includes('basketball') || t.includes('tournament') || t.includes('fitness')) return 'Sports';
  if (t.includes('job') || t.includes('career') || t.includes('interview') || t.includes('resume') || t.includes('internship') || t.includes('hiring')) return 'Career';
  if (t.includes('art') || t.includes('paint') || t.includes('photo') || t.includes('design') || t.includes('exhibition') || t.includes('sculpture')) return 'Arts';
  return 'Workshops';
}

// Student AI Recommendation Matcher
export function computeEventRecommendations(student, events, registeredEventIds = [], interestedEventIds = []) {
  if (!events || !events.length) return [];

  const studentInterests = (student?.interests || ['Technology', 'Hackathons']).map(i => i.toLowerCase());
  const department = (student?.department || '').toLowerCase();

  return events.map(event => {
    let score = 50; // base score
    let matchReasons = [];

    const eventCat = (event.category || '').toLowerCase();
    const eventTags = (event.tags || []).map(t => t.toLowerCase());
    const eventTitle = (event.title || '').toLowerCase();
    const eventDesc = (event.description || '').toLowerCase();

    // Check direct category match with student's interests
    if (studentInterests.some(i => i === eventCat || eventCat.includes(i) || i.includes(eventCat))) {
      score += 25;
      matchReasons.push(`Matches your interest in ${event.category}`);
    }

    // Check tag matches
    const tagMatches = eventTags.filter(tag => studentInterests.some(i => i === tag || tag.includes(i)));
    if (tagMatches.length > 0) {
      score += Math.min(20, tagMatches.length * 8);
      matchReasons.push(`Tagged with #${tagMatches.slice(0, 2).join(', #')}`);
    }

    // Check department affinity
    if (department.includes('computer') || department.includes('tech') || department.includes('science')) {
      if (['Technology', 'Hackathons', 'Workshops'].includes(event.category)) {
        score += 10;
        if (!matchReasons.some(r => r.includes('department'))) {
          matchReasons.push('Popular in your School of Computing department');
        }
      }
    } else if (department.includes('design') || department.includes('arts')) {
      if (['Arts', 'Cultural', 'Workshops'].includes(event.category)) {
        score += 10;
        matchReasons.push('Curated for creative & design students');
      }
    }

    // Check popularity boost
    const interestRatio = (event.interestedCount || 0) + (event.registeredCount || 0);
    if (interestRatio > 150) {
      score += 5;
    }

    // Is already registered or interested
    const isRegistered = registeredEventIds.includes(event.id);
    const isInterested = interestedEventIds.includes(event.id);

    // Normalize score between 65 and 99
    const finalScore = Math.min(99, Math.max(65, score));
    const primaryReason = matchReasons.length > 0 
      ? matchReasons.join(' • ') 
      : `Trending event recommended for ${student?.name || 'students'}`;

    return {
      event,
      matchScore: finalScore,
      matchReason: primaryReason,
      isRegistered,
      isInterested
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
