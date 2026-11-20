import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { db } from './db.js';
import { generateEventCopy, suggestCategoryFromText, computeEventRecommendations } from './ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Helper: Calculate event dates and statuses dynamically
function enrichEvent(event) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // End of current week (Sunday)
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

  const eventDate = new Date(event.date);
  const eventDateStr = event.date;

  const isToday = eventDateStr === todayStr;
  const isThisWeek = eventDateStr >= todayStr && eventDateStr <= endOfWeekStr;
  
  let dynamicStatus = 'upcoming';
  if (eventDateStr < todayStr) {
    dynamicStatus = 'completed';
  } else if (isToday) {
    dynamicStatus = 'today';
  } else if (event.registeredCount >= event.seatLimit) {
    dynamicStatus = 'full';
  }

  const remainingSeats = Math.max(0, event.seatLimit - (event.registeredCount || 0));
  const capacityPercent = Math.min(100, Math.round(((event.registeredCount || 0) / event.seatLimit) * 100));

  return {
    ...event,
    isToday,
    isThisWeek,
    dynamicStatus,
    remainingSeats,
    capacityPercent,
    isFull: remainingSeats === 0
  };
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Optional Auth (for public routes that enrich user state if logged in)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) req.user = user;
    next();
  });
}

// ----------------- AUTH ROUTES ----------------- //

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPass } = user;
    res.json({ token, user: userWithoutPass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quick 1-Click Demo Login (Student or Organiser)
app.post('/api/auth/demo-login', (req, res) => {
  try {
    const { role } = req.body; // 'student' or 'organiser'
    const targetEmail = role === 'organiser' 
      ? 'sarah.lead@campus.edu' 
      : 'alex.student@campus.edu';

    const user = db.getUserByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found. Try resetting demo data.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPass } = user;
    res.json({ token, user: userWithoutPass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Signup
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password, role, department, interests } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required' });
    }

    if (!['student', 'organiser'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student or organiser' });
    }

    if (db.getUserByEmail(email)) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const defaultAvatars = {
      student: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      organiser: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
    };

    const newUser = db.createUser({
      name,
      email,
      password: hashedPassword,
      role,
      department: department || (role === 'student' ? 'Computer Science' : 'Student Activities Council'),
      year: role === 'student' ? '2nd Year' : undefined,
      title: role === 'organiser' ? 'Campus Event Coordinator' : undefined,
      avatar: defaultAvatars[role],
      interests: Array.isArray(interests) && interests.length > 0 ? interests : ['Technology', 'Hackathons', 'Workshops']
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPass } = newUser;
    res.status(201).json({ token, user: userWithoutPass });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Current User Me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass });
});

// ----------------- EVENT ROUTES ----------------- //

// List events with search, category filter, date filter, sort
app.get('/api/events', optionalAuth, (req, res) => {
  try {
    const { search, category, timeframe, sort, featuredOnly } = req.query;
    let events = db.getAllEvents().map(enrichEvent);

    // Filter by search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Filter by Category
    if (category && category !== 'All') {
      events = events.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by timeframe
    if (timeframe) {
      if (timeframe === 'today') {
        events = events.filter(e => e.isToday);
      } else if (timeframe === 'week') {
        events = events.filter(e => e.isThisWeek);
      } else if (timeframe === 'upcoming') {
        events = events.filter(e => e.dynamicStatus !== 'completed');
      } else if (timeframe === 'completed') {
        events = events.filter(e => e.dynamicStatus === 'completed');
      }
    }

    // Filter featured
    if (featuredOnly === 'true') {
      events = events.filter(e => e.featured);
    }

    // Sorting
    if (sort === 'popular') {
      events.sort((a, b) => ((b.registeredCount || 0) + (b.interestedCount || 0)) - ((a.registeredCount || 0) + (a.interestedCount || 0)));
    } else if (sort === 'seats') {
      events.sort((a, b) => b.remainingSeats - a.remainingSeats);
    } else if (sort === 'date_desc') {
      events.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      // Default: earliest date first (upcoming first)
      events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // If user is authenticated, attach registration status and interest status
    if (req.user) {
      const userRegs = db.getRegistrationsByUserId(req.user.id);
      const userInterests = db.getUserInterests(req.user.id);
      
      events = events.map(e => ({
        ...e,
        isRegistered: userRegs.some(r => r.eventId === e.id),
        isInterested: userInterests.includes(e.id)
      }));
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Event by ID
app.get('/api/events/:id', optionalAuth, (req, res) => {
  try {
    const raw = db.getEventById(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Event not found' });

    const event = enrichEvent(raw);
    
    let isRegistered = false;
    let registrationDetails = null;
    let isInterested = false;

    if (req.user) {
      const reg = db.getRegistrationsByUserId(req.user.id).find(r => r.eventId === event.id);
      if (reg) {
        isRegistered = true;
        registrationDetails = reg;
      }
      isInterested = db.getUserInterests(req.user.id).includes(event.id);
    }

    res.json({
      ...event,
      isRegistered,
      registrationDetails,
      isInterested
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Event (Organiser only)
app.post('/api/events', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'organiser') {
      return res.status(403).json({ error: 'Only organisers can create events' });
    }

    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      banner,
      seatLimit,
      tags,
      agenda,
      featured
    } = req.body;

    if (!title || !description || !category || !date || !time || !venue || !seatLimit) {
      return res.status(400).json({ error: 'Please provide all required event details' });
    }

    const defaultBanners = {
      Technology: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      Hackathons: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
      Gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
      Cultural: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
      Workshops: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=1200',
      Career: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200',
      Sports: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200',
      Arts: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1200'
    };

    const newEvent = db.createEvent({
      title,
      description,
      category,
      date,
      time,
      venue,
      banner: banner || defaultBanners[category] || defaultBanners.Technology,
      seatLimit: parseInt(seatLimit, 10),
      organiserId: req.user.id,
      organiserName: req.user.name,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [category]),
      agenda: Array.isArray(agenda) ? agenda : [],
      featured: Boolean(featured)
    });

    res.status(201).json(enrichEvent(newEvent));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Event (Organiser only)
app.put('/api/events/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'organiser') {
      return res.status(403).json({ error: 'Only organisers can update events' });
    }

    const event = db.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Ensure organiser owns this event (or allow demo admin)
    if (event.organiserId !== req.user.id && req.user.email !== 'sarah.lead@campus.edu') {
      return res.status(403).json({ error: 'You can only edit events you organized' });
    }

    const updates = { ...req.body };
    if (updates.seatLimit) updates.seatLimit = parseInt(updates.seatLimit, 10);
    delete updates.id;
    delete updates.registeredCount;

    const updated = db.updateEvent(req.params.id, updates);
    res.json(enrichEvent(updated));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Event (Organiser only)
app.delete('/api/events/:id', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'organiser') {
      return res.status(403).json({ error: 'Only organisers can delete events' });
    }

    const event = db.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.organiserId !== req.user.id && req.user.email !== 'sarah.lead@campus.edu') {
      return res.status(403).json({ error: 'You can only delete events you organized' });
    }

    db.deleteEvent(req.params.id);
    res.json({ success: true, message: 'Event successfully deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- REGISTRATION & INTERACTION ROUTES ----------------- //

// Register for an event (One-click)
app.post('/api/events/:id/register', authenticateToken, (req, res) => {
  try {
    const { registration, event } = db.registerForEvent(req.user.id, req.params.id);
    res.status(201).json({
      success: true,
      registration,
      event: enrichEvent(event),
      message: `Successfully registered! Ticket #${registration.ticketCode} issued.`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancel registration (frees seat)
app.delete('/api/events/:id/register', authenticateToken, (req, res) => {
  try {
    const result = db.cancelRegistration(req.user.id, req.params.id);
    res.json({
      success: true,
      message: 'Registration successfully cancelled. Seat has been released.',
      event: enrichEvent(result.event)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle Interested / Bookmark
app.post('/api/events/:id/interest', authenticateToken, (req, res) => {
  try {
    const result = db.toggleInterest(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get User's Registered Events (My Events)
app.get('/api/user/registrations', authenticateToken, (req, res) => {
  try {
    const userRegs = db.getRegistrationsByUserId(req.user.id);
    const enriched = userRegs.map(reg => {
      const eventRaw = db.getEventById(reg.eventId);
      return {
        ...reg,
        event: eventRaw ? enrichEvent(eventRaw) : null
      };
    }).filter(item => item.event !== null);

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User's Interested Events
app.get('/api/user/interests', authenticateToken, (req, res) => {
  try {
    const interestIds = db.getUserInterests(req.user.id);
    const events = interestIds
      .map(id => db.getEventById(id))
      .filter(Boolean)
      .map(enrichEvent);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Attendees for an Event (Organiser only)
app.get('/api/events/:id/attendees', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'organiser') {
      return res.status(403).json({ error: 'Only organisers can view attendee lists' });
    }

    const event = db.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const attendees = db.getRegistrationsByEventId(req.params.id);
    res.json({
      eventId: event.id,
      eventTitle: event.title,
      seatLimit: event.seatLimit,
      registeredCount: attendees.length,
      attendees
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- AI ROUTES ----------------- //

// AI Event Description & Tag Generator
app.post('/api/ai/generate-event', authenticateToken, async (req, res) => {
  try {
    const { topic, audience, category, rawInput } = req.body;
    const generated = await generateEventCopy({ topic, audience, category, rawInput });
    res.json(generated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Category Suggester
app.post('/api/ai/suggest-category', (req, res) => {
  try {
    const { title, description } = req.body;
    const combined = `${title || ''} ${description || ''}`;
    const category = suggestCategoryFromText(combined);
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Personalized Event Recommendations
app.get('/api/ai/recommendations', authenticateToken, (req, res) => {
  try {
    const user = db.getUserById(req.user.id);
    const events = db.getAllEvents().map(enrichEvent);
    const userRegs = db.getRegistrationsByUserId(req.user.id).map(r => r.eventId);
    const userInterests = db.getUserInterests(req.user.id);

    const recommendations = computeEventRecommendations(user, events, userRegs, userInterests);
    res.json(recommendations.slice(0, 6)); // Top 6 recommendations
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- NOTIFICATIONS ROUTES ----------------- //

app.get('/api/notifications', authenticateToken, (req, res) => {
  try {
    const notifs = db.getNotifications(req.user.id);
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const updated = db.markNotificationRead(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  try {
    db.markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test trigger a live reminder
app.post('/api/notifications/trigger-reminder', authenticateToken, (req, res) => {
  try {
    const events = db.getAllEvents();
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const notif = db.createNotification({
      userId: req.user.id,
      title: 'Upcoming Campus Event Alert 🔔',
      message: `Don't forget: "${randomEvent ? randomEvent.title : 'Featured Event'}" has limited seats left!`,
      type: 'reminder',
      eventId: randomEvent?.id
    });
    res.json(notif);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- ORGANISER ANALYTICS ----------------- //

app.get('/api/organiser/analytics', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'organiser') {
      return res.status(403).json({ error: 'Only organisers can view analytics' });
    }

    const allEvents = db.getAllEvents().map(enrichEvent);
    // Include events created by this organiser or all if demo
    const organiserEvents = allEvents;

    const totalEvents = organiserEvents.length;
    const totalRegistrations = organiserEvents.reduce((acc, e) => acc + (e.registeredCount || 0), 0);
    const totalInterested = organiserEvents.reduce((acc, e) => acc + (e.interestedCount || 0), 0);
    const totalSeats = organiserEvents.reduce((acc, e) => acc + (e.seatLimit || 0), 0);
    const avgFillRate = totalSeats > 0 ? Math.round((totalRegistrations / totalSeats) * 100) : 0;

    // Category distribution
    const categoryStats = {};
    organiserEvents.forEach(e => {
      if (!categoryStats[e.category]) {
        categoryStats[e.category] = { count: 0, registrations: 0 };
      }
      categoryStats[e.category].count += 1;
      categoryStats[e.category].registrations += (e.registeredCount || 0);
    });

    const categoryList = Object.entries(categoryStats).map(([name, data]) => ({
      category: name,
      events: data.count,
      registrations: data.registrations
    }));

    // Top performing events
    const topEvents = [...organiserEvents]
      .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
      .slice(0, 5);

    // Recent registrations feed
    const allRegistrations = db.data.registrations
      .slice(-10)
      .reverse()
      .map(reg => {
        const ev = db.getEventById(reg.eventId);
        return {
          ...reg,
          eventTitle: ev ? ev.title : 'Event'
        };
      });

    res.json({
      totalEvents,
      totalRegistrations,
      totalInterested,
      totalSeats,
      avgFillRate,
      categoryList,
      topEvents,
      recentRegistrations: allRegistrations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset demo data
app.post('/api/system/reset-demo', (req, res) => {
  try {
    db.resetDatabase();
    res.json({ success: true, message: 'Database reset to initial demo data' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend build if dist exists
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 CampusConnect Server running on http://localhost:${PORT}`);
});
