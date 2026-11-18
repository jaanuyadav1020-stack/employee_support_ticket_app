const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const DEFAULT_PASSWORD = 'Password123!';

function seedDatabase(dbInstance) {
  const db = dbInstance || getDb();

  // Clear existing data
  db.exec('DELETE FROM comments;');
  db.exec('DELETE FROM tickets;');
  db.exec('DELETE FROM users;');

  // Hash the default password (synchronous for seeding)
  const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

  // Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const users = [
    { id: 'emp-1', name: 'Alice Johnson', email: 'alice.johnson@company.com', role: 'EMPLOYEE' },
    { id: 'emp-2', name: 'Charlie Brown', email: 'charlie.brown@company.com', role: 'EMPLOYEE' },
    { id: 'staff-1', name: 'Bob Smith', email: 'bob.smith@support.com', role: 'SUPPORT' }
  ];

  for (const user of users) {
    insertUser.run(user.id, user.name, user.email, passwordHash, user.role);
  }

  // Insert Tickets
  const insertTicket = db.prepare(`
    INSERT INTO tickets (title, description, category, priority, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tickets = [
    {
      title: 'Second monitor not receiving signal over HDMI',
      description: 'Since this morning, my secondary Dell monitor keeps displaying "No HDMI Signal from your device". I have tried swapping the HDMI cable and restarting my laptop, but it still does not connect.',
      category: 'Hardware',
      priority: 'Medium',
      status: 'Open',
      created_by: 'emp-1'
    },
    {
      title: 'Need access to Marketing Figma workspace',
      description: 'I recently joined the Q4 campaign project and need editor access to the Marketing team Figma workspace to review creative mockups.',
      category: 'Access & Accounts',
      priority: 'Low',
      status: 'In Progress',
      created_by: 'emp-1'
    },
    {
      title: 'VPN disconnects every 15 minutes when working remotely',
      description: 'The corporate VPN client (OpenConnect) drops connection every 10-15 minutes with a TLS handshake timeout error. Disrupts meetings and remote ssh sessions.',
      category: 'Network',
      priority: 'High',
      status: 'Open',
      created_by: 'emp-2'
    },
    {
      title: 'Conference room 3B display audio not functioning',
      description: 'During team standup today, the speakers in Conference room 3B were completely muted despite max volume on the wall dial.',
      category: 'Facilities',
      priority: 'Medium',
      status: 'Resolved',
      created_by: 'emp-2'
    }
  ];

  for (const ticket of tickets) {
    insertTicket.run(
      ticket.title,
      ticket.description,
      ticket.category,
      ticket.priority,
      ticket.status,
      ticket.created_by
    );
  }

  // Insert initial comments on Ticket 2 (Figma access)
  const insertComment = db.prepare(`
    INSERT INTO comments (ticket_id, user_id, message)
    VALUES (?, ?, ?)
  `);

  insertComment.run(2, 'staff-1', 'Hello Alice, could you please provide your Figma account email so I can send the team invitation?');
  insertComment.run(2, 'emp-1', 'Hi Bob, it is alice.johnson@company.com. Thanks!');

  if (!dbInstance) {
    console.log('Database seeded successfully with users, sample tickets, and comments.');
    console.log('Default password for all accounts: Password123!');
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
