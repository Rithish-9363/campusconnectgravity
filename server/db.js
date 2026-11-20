import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper to get formatted date string: YYYY-MM-DD
function getOffsetDate(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

function getSeedData() {
  const salt = bcrypt.genSaltSync(10);
  const studentPasswordHash = bcrypt.hashSync('student123', salt);
  const organiserPasswordHash = bcrypt.hashSync('organiser123', salt);

  const users = [
    {
      id: 'usr_student_1',
      name: 'Alex Rivera',
      email: 'alex.student@campus.edu',
      password: studentPasswordHash,
      role: 'student',
      department: 'Computer Science & AI',
      year: '3rd Year',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      interests: ['Technology', 'Hackathons', 'Workshops', 'AI', 'Gaming'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_organiser_1',
      name: 'Sarah Chen',
      email: 'sarah.lead@campus.edu',
      password: organiserPasswordHash,
      role: 'organiser',
      department: 'School of Computing & Engineering',
      title: 'President, Student Council & Tech Lead',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      interests: ['Leadership', 'Technology', 'Career'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_student_2',
      name: 'Marcus Johnson',
      email: 'marcus.student@campus.edu',
      password: studentPasswordHash,
      role: 'student',
      department: 'Design & Media Arts',
      year: '2nd Year',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      interests: ['Cultural', 'Arts', 'Workshops', 'Music'],
      createdAt: new Date().toISOString()
    }
  ];

  const today = getOffsetDate(0);
  const tomorrow = getOffsetDate(1);
  const in3Days = getOffsetDate(3);
  const in5Days = getOffsetDate(5);
  const in8Days = getOffsetDate(8);
  const in12Days = getOffsetDate(12);
  const in16Days = getOffsetDate(16);
  const yesterday = getOffsetDate(-1);

  const events = [
    {
      id: 'evt_1',
      title: 'HackCampus 2026: 24-Hour AI & Web3 Sprint',
      description: 'The flagship annual hackathon of CampusConnect! Build disruptive projects in AI agents, decentralized tech, and sustainability. $10,000 in prizes, free food, mentor workshops, and exclusive sponsor swag.',
      category: 'Hackathons',
      date: today,
      time: '09:00 AM - 09:00 AM (+1 Day)',
      venue: 'Campus Innovation Center, Grand Hall A',
      banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 120,
      registeredCount: 114,
      interestedCount: 280,
      organiserId: 'usr_organiser_1',
      organiserName: 'Sarah Chen (Tech Council)',
      featured: true,
      tags: ['AI', 'Hackathon', 'Coding', 'Prizes', 'Team'],
      agenda: ['09:00 AM - Check-in & Team Formation', '11:00 AM - Keynote & Hacking Begins', '08:00 PM - Mentor Pitch Sessions', '09:00 AM (+1) - Demos & Winner Ceremony'],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'evt_2',
      title: 'NextGen AI & Autonomous Agents Masterclass',
      description: 'Deep dive into building multi-agent systems, LLM fine-tuning, and real-world retrieval augmented generation (RAG) pipelines. Hosted by visiting industry engineers from Google DeepMind & OpenAI.',
      category: 'Technology',
      date: today,
      time: '02:00 PM - 04:30 PM',
      venue: 'Turing Hall, Computer Science Block',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 80,
      registeredCount: 78,
      interestedCount: 195,
      organiserId: 'usr_organiser_1',
      organiserName: 'Sarah Chen (Tech Council)',
      featured: true,
      tags: ['AI', 'DeepLearning', 'Workshop', 'Tech'],
      agenda: ['02:00 PM - Foundations of Autonomous Agents', '03:15 PM - Live Coding: Building your First Agent', '04:00 PM - Q&A and Career Networking'],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'evt_3',
      title: 'Annual Inter-College Esports Arena Tournament',
      description: 'Cheer or compete in Valorant, EA FC, and Rocket League showdowns! Live casting on the arena mega-screens, gaming equipment stations, and cash trophies for winning collegiate squads.',
      category: 'Gaming',
      date: tomorrow,
      time: '11:00 AM - 07:00 PM',
      venue: 'Student Recreation Complex, Arena 2',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 150,
      registeredCount: 138,
      interestedCount: 310,
      organiserId: 'usr_organiser_1',
      organiserName: 'Campus Esports Guild',
      featured: false,
      tags: ['Gaming', 'Esports', 'Valorant', 'Tournament'],
      agenda: ['11:00 AM - Qualifier Brackets', '03:00 PM - Semi-Finals Live Stream', '05:30 PM - Grand Finals & Trophy Ceremony'],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'evt_4',
      title: 'Campus Sunset Acoustic Jam & Open Mic',
      description: 'Unwind under the dusk sky with acoustic melodies, indie bands, spoken word poetry, and complimentary artisan coffee. Open mic slots available for student singers and instrumentalists.',
      category: 'Cultural',
      date: in3Days,
      time: '05:30 PM - 08:30 PM',
      venue: 'Amphitheater Lawn & Lakeview Deck',
      banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 200,
      registeredCount: 145,
      interestedCount: 220,
      organiserId: 'usr_organiser_1',
      organiserName: 'Music & Cultural Society',
      featured: true,
      tags: ['Music', 'Acoustic', 'OpenMic', 'Relax', 'Coffee'],
      agenda: ['05:30 PM - Welcome & Indie Band Opening', '06:30 PM - Student Open Mic Performances', '08:00 PM - Acoustic Jam Session'],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'evt_5',
      title: 'UI/UX Design Sprint: Figma to Production Systems',
      description: 'Learn modern design token systems, responsive auto-layout, micro-interactions, and component architecture used by high-growth startups. Bring your laptop with Figma installed.',
      category: 'Workshops',
      date: in5Days,
      time: '10:00 AM - 01:00 PM',
      venue: 'Design Studio Lab 3, Fine Arts Wing',
      banner: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 50,
      registeredCount: 48,
      interestedCount: 120,
      organiserId: 'usr_organiser_1',
      organiserName: 'Design Collective',
      featured: false,
      tags: ['Design', 'Figma', 'UI/UX', 'Portfolio'],
      agenda: ['10:00 AM - Design System Foundations', '11:15 AM - Interactive Prototyping Challenge', '12:30 PM - Portfolio Critiques'],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'evt_6',
      title: 'Tech Career Fair & Executive Networking Night',
      description: 'Connect directly with recruiters from top engineering firms, FinTech giants, and venture-backed startups. Resume reviews on the spot, fast-track interview vouchers, and LinkedIn headshots.',
      category: 'Career',
      date: in8Days,
      time: '01:00 PM - 06:00 PM',
      venue: 'University Grand Exhibition Center',
      banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 300,
      registeredCount: 260,
      interestedCount: 450,
      organiserId: 'usr_organiser_1',
      organiserName: 'Career & Placement Cell',
      featured: true,
      tags: ['Career', 'Internships', 'Jobs', 'Networking'],
      agenda: ['01:00 PM - Company Booths Open', '03:00 PM - Panel: Cracking the 2026 Tech Interview', '04:30 PM - 1-on-1 Speed Networking'],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'evt_7',
      title: 'Campus 3v3 Basketball Showdown',
      description: 'High energy 3-on-3 half-court basketball bracket. Fast-paced 12-minute games, prizes for champions and 3-point contest winners, plus DJ beats courtside.',
      category: 'Sports',
      date: in12Days,
      time: '04:00 PM - 08:00 PM',
      venue: 'Sports Pavilion Courts 1 & 2',
      banner: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 64,
      registeredCount: 64, // Full event demonstration
      interestedCount: 160,
      organiserId: 'usr_organiser_1',
      organiserName: 'Athletic Department',
      featured: false,
      tags: ['Sports', 'Basketball', 'Fitness', 'Tournament'],
      agenda: ['04:00 PM - Player Warmups & Roll Call', '04:30 PM - Knockout Rounds', '07:15 PM - Championship Game & Awards'],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'evt_8',
      title: 'Contemporary Student Art & Sculpture Showcase',
      description: 'An exhibition celebrating visual artists on campus. Showcasing digital art, oil canvas, physical kinetic sculptures, and interactive light installations. Wine and mocktails served.',
      category: 'Arts',
      date: in16Days,
      time: '03:00 PM - 07:00 PM',
      venue: 'Campus Gallery of Modern Art',
      banner: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 100,
      registeredCount: 42,
      interestedCount: 95,
      organiserId: 'usr_organiser_1',
      organiserName: 'Fine Arts Society',
      featured: false,
      tags: ['Art', 'Exhibition', 'Culture', 'Gallery'],
      agenda: ['03:00 PM - Gallery Walkthrough', '04:30 PM - Artist Statement Discussions', '06:00 PM - Audience Choice Voting'],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'evt_9',
      title: 'Full-Stack Robotics & Drone Flight Workshop',
      description: 'Hands-on programming of autonomous micro-drones using ROS (Robot Operating System) and computer vision. Hardware kits provided for all registered teams.',
      category: 'Workshops',
      date: in5Days,
      time: '01:00 PM - 05:00 PM',
      venue: 'Robotics Research Lab 102',
      banner: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 35,
      registeredCount: 31,
      interestedCount: 88,
      organiserId: 'usr_organiser_1',
      organiserName: 'Sarah Chen (Tech Council)',
      featured: false,
      tags: ['Robotics', 'Drones', 'Hardware', 'ROS'],
      agenda: ['01:00 PM - Drone Aerodynamics & Safety', '02:00 PM - Computer Vision Navigation', '04:00 PM - Obstacle Course Flight Test'],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'evt_10',
      title: 'Alumni Tech Founders Round Table',
      description: 'Learn directly from campus alumni who built YC-backed companies, secured Series A funding, and transitioned from dorm-room projects to global tech businesses.',
      category: 'Career',
      date: yesterday,
      time: '06:00 PM - 08:30 PM',
      venue: 'Executive Seminar Hall',
      banner: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200',
      seatLimit: 100,
      registeredCount: 100,
      interestedCount: 240,
      organiserId: 'usr_organiser_1',
      organiserName: 'Entrepreneurship Cell',
      featured: false,
      tags: ['Startups', 'Founders', 'Alumni', 'Venture'],
      agenda: ['Completed event'],
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ];

  // Pre-seed some registrations for the student demo user
  const registrations = [
    {
      id: 'reg_101',
      eventId: 'evt_1',
      userId: 'usr_student_1',
      userName: 'Alex Rivera',
      userEmail: 'alex.student@campus.edu',
      userDepartment: 'Computer Science & AI',
      ticketCode: 'CC-AI-9482',
      status: 'confirmed',
      registeredAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'reg_102',
      eventId: 'evt_2',
      userId: 'usr_student_1',
      userName: 'Alex Rivera',
      userEmail: 'alex.student@campus.edu',
      userDepartment: 'Computer Science & AI',
      ticketCode: 'CC-AGNT-3174',
      status: 'confirmed',
      registeredAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ];

  const interests = [
    { userId: 'usr_student_1', eventId: 'evt_3' },
    { userId: 'usr_student_1', eventId: 'evt_4' }
  ];

  const notifications = [
    {
      id: 'notif_1',
      userId: 'usr_student_1',
      title: 'Event Starting Today!',
      message: 'HackCampus 2026 starts today at 09:00 AM in the Innovation Center.',
      type: 'reminder',
      eventId: 'evt_1',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif_2',
      userId: 'usr_student_1',
      title: 'Registration Confirmed',
      message: 'You have secured seat #78 for NextGen AI & Autonomous Agents Masterclass.',
      type: 'confirmation',
      eventId: 'evt_2',
      read: true,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'notif_3',
      userId: 'usr_organiser_1',
      title: 'High Demand Alert',
      message: 'HackCampus 2026 has reached 95% capacity (114/120 seats booked).',
      type: 'alert',
      eventId: 'evt_1',
      read: false,
      createdAt: new Date().toISOString()
    }
  ];

  return { users, events, registrations, interests, notifications };
}

// Database wrapper
class Database {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getSeedData();
        this.save();
      }
    } catch (e) {
      console.error('Failed to load database, resetting with seed data:', e);
      this.data = getSeedData();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save database:', e);
    }
  }

  // Users
  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Events
  getAllEvents() {
    return this.data.events;
  }

  getEventById(id) {
    return this.data.events.find(e => e.id === id);
  }

  createEvent(eventData) {
    const newEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      registeredCount: 0,
      interestedCount: 0,
      createdAt: new Date().toISOString(),
      ...eventData
    };
    this.data.events.unshift(newEvent);
    this.save();
    return newEvent;
  }

  updateEvent(id, updates) {
    const index = this.data.events.findIndex(e => e.id === id);
    if (index === -1) return null;
    this.data.events[index] = { ...this.data.events[index], ...updates };
    this.save();
    return this.data.events[index];
  }

  deleteEvent(id) {
    const initialLen = this.data.events.length;
    this.data.events = this.data.events.filter(e => e.id !== id);
    // Also remove associated registrations
    this.data.registrations = this.data.registrations.filter(r => r.eventId !== id);
    this.data.interests = this.data.interests.filter(i => i.eventId !== id);
    this.save();
    return this.data.events.length < initialLen;
  }

  // Registrations
  getRegistrationsByEventId(eventId) {
    return this.data.registrations.filter(r => r.eventId === eventId);
  }

  getRegistrationsByUserId(userId) {
    return this.data.registrations.filter(r => r.userId === userId);
  }

  hasUserRegistered(userId, eventId) {
    return this.data.registrations.some(r => r.userId === userId && r.eventId === eventId && r.status !== 'cancelled');
  }

  registerForEvent(userId, eventId) {
    const event = this.getEventById(eventId);
    if (!event) throw new Error('Event not found');
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    if (this.hasUserRegistered(userId, eventId)) {
      throw new Error('Already registered for this event');
    }

    if (event.registeredCount >= event.seatLimit) {
      throw new Error('This event is already at full capacity');
    }

    const reg = {
      id: 'reg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      eventId,
      userId,
      userName: user.name,
      userEmail: user.email,
      userDepartment: user.department || 'Undergraduate Student',
      ticketCode: 'CC-' + event.category.slice(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000),
      status: 'confirmed',
      registeredAt: new Date().toISOString()
    };

    this.data.registrations.push(reg);
    event.registeredCount = (event.registeredCount || 0) + 1;

    // Create confirmation notification for student
    this.createNotification({
      userId,
      title: 'Registration Confirmed!',
      message: `You are booked for "${event.title}". Ticket Code: ${reg.ticketCode}`,
      type: 'confirmation',
      eventId
    });

    // Notify organiser
    if (event.organiserId) {
      this.createNotification({
        userId: event.organiserId,
        title: 'New Student Registration',
        message: `${user.name} registered for "${event.title}". Seats: ${event.registeredCount}/${event.seatLimit}`,
        type: 'update',
        eventId
      });
    }

    this.save();
    return { registration: reg, event };
  }

  cancelRegistration(userId, eventId) {
    const regIndex = this.data.registrations.findIndex(r => r.userId === userId && r.eventId === eventId && r.status !== 'cancelled');
    if (regIndex === -1) throw new Error('Active registration not found');

    this.data.registrations.splice(regIndex, 1);
    const event = this.getEventById(eventId);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
    }

    this.createNotification({
      userId,
      title: 'Registration Cancelled',
      message: `Your registration for "${event ? event.title : 'Event'}" has been cancelled. Seat returned to pool.`,
      type: 'reminder',
      eventId
    });

    this.save();
    return { success: true, event };
  }

  // Interests / Bookmark
  toggleInterest(userId, eventId) {
    const event = this.getEventById(eventId);
    if (!event) throw new Error('Event not found');

    const index = this.data.interests.findIndex(i => i.userId === userId && i.eventId === eventId);
    let interested = false;
    if (index > -1) {
      this.data.interests.splice(index, 1);
      event.interestedCount = Math.max(0, (event.interestedCount || 0) - 1);
      interested = false;
    } else {
      this.data.interests.push({ userId, eventId });
      event.interestedCount = (event.interestedCount || 0) + 1;
      interested = true;
    }
    this.save();
    return { interested, count: event.interestedCount };
  }

  getUserInterests(userId) {
    return this.data.interests.filter(i => i.userId === userId).map(i => i.eventId);
  }

  // Notifications
  getNotifications(userId) {
    return this.data.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createNotification(notif) {
    const newNotif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      read: false,
      createdAt: new Date().toISOString(),
      ...notif
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationRead(id) {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.save();
    }
    return n;
  }

  markAllNotificationsRead(userId) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  // Reset to seed data
  resetDatabase() {
    this.data = getSeedData();
    this.save();
    return this.data;
  }
}

export const db = new Database();
