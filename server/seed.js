const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Visitor = require('./models/Visitor');
const Appointment = require('./models/Appointment');
const Pass = require('./models/Pass');
const CheckLog = require('./models/CheckLog');
const { generateQRCodeDataURL, generatePassCode } = require('./utils/qrGenerator');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_pass_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database...');

    // Clear existing collections
    await User.deleteMany({});
    await Visitor.deleteMany({});
    await Appointment.deleteMany({});
    await Pass.deleteMany({});
    await CheckLog.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // 1. Create Users
    console.log('[Seed] Creating User accounts (Admin, Security, Employees, Visitors)...');
    const admin = await User.create({
      name: 'Sarah Admin',
      email: 'admin@techcorp.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT & Administration',
      phone: '+1 555-0100',
      organization: 'TechCorp Solutions HQ',
    });

    const security = await User.create({
      name: 'Officer John Miller',
      email: 'security@techcorp.com',
      password: 'security123',
      role: 'security',
      department: 'Security & Facilities',
      phone: '+1 555-0101',
      organization: 'TechCorp Solutions HQ',
    });

    const host1 = await User.create({
      name: 'Alex Morgan',
      email: 'alex.morgan@techcorp.com',
      password: 'employee123',
      role: 'employee',
      department: 'Software Engineering',
      phone: '+1 555-0102',
      organization: 'TechCorp Solutions HQ',
    });

    const host2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@techcorp.com',
      password: 'employee123',
      role: 'employee',
      department: 'Human Resources',
      phone: '+1 555-0103',
      organization: 'TechCorp Solutions HQ',
    });

    const host3 = await User.create({
      name: 'Robert Chen',
      email: 'robert.chen@techcorp.com',
      password: 'employee123',
      role: 'employee',
      department: 'Product & Marketing',
      phone: '+1 555-0104',
      organization: 'TechCorp Solutions HQ',
    });

    const visitorUser = await User.create({
      name: 'Emily Watson',
      email: 'visitor@example.com',
      password: 'visitor123',
      role: 'visitor',
      department: 'External Guest',
      phone: '+1 555-0199',
      organization: 'Acme Cloud Consulting',
    });

    // 2. Create Visitors
    console.log('[Seed] Creating Visitor Profiles...');
    const visitor1 = await Visitor.create({
      fullName: 'Emily Watson',
      email: 'visitor@example.com',
      phone: '+1 555-0199',
      company: 'Acme Cloud Consulting',
      idType: 'Driving License',
      idNumber: 'DL-NY-984214',
      address: '742 Evergreen Terrace, NY',
      userAccount: visitorUser._id,
    });

    const visitor2 = await Visitor.create({
      fullName: 'David Kumar',
      email: 'david.kumar@logistics.com',
      phone: '+1 555-0144',
      company: 'Apex Supply Chain Ltd',
      idType: 'Passport',
      idNumber: 'P-9812401',
      address: '100 Silicon Way, CA',
    });

    const visitor3 = await Visitor.create({
      fullName: 'Alice Smith',
      email: 'alice.smith@designstudio.io',
      phone: '+1 555-0177',
      company: 'Modern UX Studios',
      idType: 'Aadhaar Card',
      idNumber: 'AAD-7721-9901',
      address: '42 Innovation Blvd, Austin, TX',
    });

    const visitor4 = await Visitor.create({
      fullName: 'Marcus Vance',
      email: 'marcus.vance@datacenter.net',
      phone: '+1 555-0188',
      company: 'DataCore Systems',
      idType: 'Government ID',
      idNumber: 'GID-554109',
      address: '12 River Rd, Boston, MA',
    });

    // 3. Create Appointments
    console.log('[Seed] Creating Appointments...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appt1 = await Appointment.create({
      visitor: visitor1._id,
      host: host1._id,
      purpose: 'Job Interview',
      visitDate: today,
      visitTime: '10:30 AM',
      expectedDuration: '2 Hours',
      status: 'Approved',
      location: 'TechCorp HQ - Main Building, Floor 4 (Tech Hub)',
      invitationType: 'HostInvited',
    });

    const appt2 = await Appointment.create({
      visitor: visitor2._id,
      host: host2._id,
      purpose: 'Vendor / Supplier',
      visitDate: today,
      visitTime: '02:00 PM',
      expectedDuration: '1 Hour',
      status: 'Approved',
      location: 'TechCorp HQ - Main Building, Floor 2 (HR Meeting Room)',
      invitationType: 'VisitorPreRegistered',
    });

    const appt3 = await Appointment.create({
      visitor: visitor3._id,
      host: host3._id,
      purpose: 'Client Meeting',
      visitDate: tomorrow,
      visitTime: '11:00 AM',
      expectedDuration: '1.5 Hours',
      status: 'Pending',
      location: 'TechCorp HQ - Conference Room Alpha',
      invitationType: 'VisitorPreRegistered',
    });

    const appt4 = await Appointment.create({
      visitor: visitor4._id,
      host: host1._id,
      purpose: 'Maintenance & Repairs',
      visitDate: today,
      visitTime: '09:00 AM',
      expectedDuration: '3 Hours',
      status: 'Approved',
      location: 'Server Room B, Basement Level',
      invitationType: 'HostInvited',
    });

    // 4. Create Passes with QR codes
    console.log('[Seed] Generating Digital Passes with QR codes...');
    const passCode1 = 'VP-2026-100101';
    const qrPayload1 = {
      passCode: passCode1,
      appointmentId: appt1._id,
      visitorName: visitor1.fullName,
      hostName: host1.name,
      validUntil: new Date(new Date(today).setHours(23, 59, 59, 999)),
    };
    const qr1 = await generateQRCodeDataURL(qrPayload1);

    const pass1 = await Pass.create({
      passCode: passCode1,
      appointment: appt1._id,
      visitor: visitor1._id,
      host: host1._id,
      qrCode: qr1,
      validFrom: today,
      validUntil: new Date(new Date(today).setHours(23, 59, 59, 999)),
      gateNumber: 'Main Entrance - Gate 1',
      location: appt1.location,
      status: 'CheckedIn',
      issuedBy: host1._id,
    });

    const passCode2 = 'VP-2026-100102';
    const qrPayload2 = {
      passCode: passCode2,
      appointmentId: appt2._id,
      visitorName: visitor2.fullName,
      hostName: host2.name,
      validUntil: new Date(new Date(today).setHours(23, 59, 59, 999)),
    };
    const qr2 = await generateQRCodeDataURL(qrPayload2);

    const pass2 = await Pass.create({
      passCode: passCode2,
      appointment: appt2._id,
      visitor: visitor2._id,
      host: host2._id,
      qrCode: qr2,
      validFrom: today,
      validUntil: new Date(new Date(today).setHours(23, 59, 59, 999)),
      gateNumber: 'East Gate - Tower B',
      location: appt2.location,
      status: 'Active',
      issuedBy: host2._id,
    });

    const passCode4 = 'VP-2026-100104';
    const qrPayload4 = {
      passCode: passCode4,
      appointmentId: appt4._id,
      visitorName: visitor4.fullName,
      hostName: host1.name,
      validUntil: new Date(new Date(today).setHours(23, 59, 59, 999)),
    };
    const qr4 = await generateQRCodeDataURL(qrPayload4);

    const pass4 = await Pass.create({
      passCode: passCode4,
      appointment: appt4._id,
      visitor: visitor4._id,
      host: host1._id,
      qrCode: qr4,
      validFrom: today,
      validUntil: new Date(new Date(today).setHours(23, 59, 59, 999)),
      gateNumber: 'Service Gate 3',
      location: appt4.location,
      status: 'Completed',
      issuedBy: admin._id,
    });

    // 5. Create CheckLogs
    console.log('[Seed] Creating Check-in / Check-out Audit Logs...');
    // Visitor 1 currently checked in
    const checkInTime1 = new Date(today.getTime() - 45 * 60 * 1000); // 45 mins ago
    await CheckLog.create({
      pass: pass1._id,
      visitor: visitor1._id,
      appointment: appt1._id,
      checkInTime: checkInTime1,
      checkedInBy: security._id,
      gate: 'Main Entrance - Gate 1',
      belongings: 'MacBook Pro, Notebook, ID Badge',
      laptopSerialNumber: 'MBP-2024-8841',
      temperature: '98.6 °F',
      status: 'CheckedIn',
      remarks: 'Visitor on-site for interview at Floor 4',
    });

    // Visitor 4 already checked in and checked out
    const checkInTime4 = new Date(today.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago
    const checkOutTime4 = new Date(today.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    await CheckLog.create({
      pass: pass4._id,
      visitor: visitor4._id,
      appointment: appt4._id,
      checkInTime: checkInTime4,
      checkOutTime: checkOutTime4,
      checkedInBy: security._id,
      checkedOutBy: security._id,
      gate: 'Service Gate 3',
      belongings: 'Toolbox, Multimeter, Laptop',
      laptopSerialNumber: 'LENOVO-T490-3321',
      temperature: '98.2 °F',
      status: 'CheckedOut',
      remarks: 'Maintenance completed, exit cleared',
    });

    console.log('\n=============================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log('Demo Login Accounts:');
    console.log('1. Admin:       admin@techcorp.com        / admin123');
    console.log('2. Security:    security@techcorp.com     / security123');
    console.log('3. Employee:    alex.morgan@techcorp.com  / employee123');
    console.log('4. Visitor:     visitor@example.com       / visitor123');
    console.log('Sample Active Pass: VP-2026-100101 (Checked-in) | VP-2026-100102 (Active)');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
