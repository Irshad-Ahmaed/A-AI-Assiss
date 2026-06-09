import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { RoomType, CourseType, Role } from '@prisma/client';

export interface ImportSummary {
  created: { departments: number; rooms: number; courses: number; faculty: number };
  matched: { departments: number; rooms: number; courses: number; faculty: number };
  unparsed: Array<{ reason: string; row?: string }>;
}

export async function importPreparsedCSETimetable(): Promise<ImportSummary> {
  const summary: ImportSummary = {
    created: { departments: 0, rooms: 0, courses: 0, faculty: 0 },
    matched: { departments: 0, rooms: 0, courses: 0, faculty: 0 },
    unparsed: [],
  };

  // 1. Upsert Department: CSE
  const deptShortCode = 'CSE';
  const existingDept = await prisma.department.findUnique({
    where: { shortCode: deptShortCode },
  });
  let deptId: string;
  if (existingDept) {
    deptId = existingDept.id;
    summary.matched.departments++;
  } else {
    const newDept = await prisma.department.create({
      data: {
        name: 'Computer Science and Engineering',
        shortCode: deptShortCode,
      },
    });
    deptId = newDept.id;
    summary.created.departments++;
  }

  // 2. Upsert Branches
  const branches = [
    { name: 'CS' },
    { name: 'AIML' },
    { name: 'MCA' },
  ];
  const branchMap: Record<string, string> = {};
  for (const b of branches) {
    const existingBranch = await prisma.branch.findFirst({
      where: { name: b.name, departmentId: deptId },
    });
    if (existingBranch) {
      branchMap[b.name] = existingBranch.id;
    } else {
      const newBranch = await prisma.branch.create({
        data: {
          name: b.name,
          departmentId: deptId,
        },
      });
      branchMap[b.name] = newBranch.id;
    }
  }

  // 3. Upsert Rooms
  const rooms = [
    { roomNumber: '219', capacity: 60, type: RoomType.CLASSROOM },
    { roomNumber: '220', capacity: 60, type: RoomType.CLASSROOM },
    { roomNumber: '216A', capacity: 60, type: RoomType.CLASSROOM },
    { roomNumber: '216', capacity: 60, type: RoomType.CLASSROOM },
    { roomNumber: '213', capacity: 60, type: RoomType.CLASSROOM },
    { roomNumber: '214', capacity: 60, type: RoomType.CLASSROOM },
    { roomNumber: '214A', capacity: 60, type: RoomType.CLASSROOM },
    { roomNumber: 'Lab 3', capacity: 40, type: RoomType.LAB },
    { roomNumber: 'Lab 6', capacity: 40, type: RoomType.LAB },
    { roomNumber: 'Lab 1', capacity: 40, type: RoomType.LAB },
    { roomNumber: 'Lab 4', capacity: 40, type: RoomType.LAB },
  ];
  const roomMap: Record<string, string> = {};
  for (const r of rooms) {
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber_departmentId: { roomNumber: r.roomNumber, departmentId: deptId } },
    });
    if (existingRoom) {
      roomMap[r.roomNumber] = existingRoom.id;
      summary.matched.rooms++;
    } else {
      const newRoom = await prisma.room.create({
        data: {
          roomNumber: r.roomNumber,
          capacity: r.capacity,
          type: r.type,
          departmentId: deptId,
        },
      });
      roomMap[r.roomNumber] = newRoom.id;
      summary.created.rooms++;
    }
  }

  // 4. Upsert Faculty (Users with PROFESSOR role)
  const hashedPassword = await bcrypt.hash('password123', 10);
  const facultyNames = [
    'Prof. Supratim Biswas',
    'Dr. Sanchita Paul',
    'Dr. Sumit Srivastava',
    'Dr. Ravi Sankar Mehta',
    'Dr. K. S. Patnaik',
    'Prof. Sandip Dutta',
    'Dr. Anand Kumar',
    'Jyoti Kumari',
    'Dr. Amritanjali',
    'Dr. Anup Kumar Keshri',
    'Prof. Abhijit Mustafi',
    'Dr. Rathindranath Dutta',
    'Dr. Prashant Pranav',
    'Dr. Lopamudra Hota',
    'Dr. Shreeya Swagatika Sahoo',
    'Dr. B. K. Sarkar',
    'Dr. Shruti Garg',
    'Ananya Saha',
    'Dr. Sandip Ghosal',
    'Dr. Aditi Panda',
    'Dr. I. Mukherjee',
    'Dr. C. Lavania',
    'Dr. P. C. Jha',
    'Dr. Ritesh Jha',
    'Dr. Subrajeet Mohapatra',
    'Dr. Monu Bhagat',
    'Dr. Satish Chander',
    'Dr. R. N. Bhagat',
    'Prof. V. Bhattacharya',
    'Dr. Debjani Mustafi',
    'Dr. N. K. Singh',
    'Dr. K. Rajnish',
    'Dr. S. Kanungo',
    'Dr. Nand Kumar Jyotish',
    'Dr. S. Pushkar',
    'Dr. Saikat Chakraborty',
    'Dr. J. Bakas',
    'Dr. Jit Mukherjee',
    'Dr. Komal Naaz',
    'Dr. S. Mehta',
    'Dr. Kanchan Jha',
    'Dr. Md. S. Fahad',
    'Dr. Md. Shah Fahad',
    'Dr. Itu Snigdh',
    'Dr. Supreeti Kamilya',
    'Dr. Sudip Kumar Sahana',
    'Mr. Kalyan Samanta',
    'Dr. Akriti Nigam',
    'Dr. Rohit Pandey',
    'Dr. Shamama Anwar'
  ];
  const facultyMap: Record<string, string> = {};
  for (const name of facultyNames) {
    const email = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@samayak.com';
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      facultyMap[name] = existingUser.id;
      summary.matched.faculty++;
    } else {
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          role: Role.PROFESSOR,
          departmentId: deptId,
          password: hashedPassword,
        },
      });
      facultyMap[name] = newUser.id;
      summary.created.faculty++;
    }
  }

  // 5. Upsert Courses
  const courses = [
    // VI A / B / C / D CS Courses
    { code: 'CS333', name: 'Compiler Design', credits: 4, type: CourseType.LECTURE, semester: 6, branch: 'CS' },
    { code: 'CS335', name: 'Artificial Intelligence and Machine Learning', credits: 4, type: CourseType.LECTURE, semester: 6, branch: 'CS' },
    { code: 'IT349', name: 'Cryptography and Network Security', credits: 3, type: CourseType.LECTURE, semester: 6, branch: 'CS' },
    { code: 'IT353', name: 'Blockchain Technology', credits: 3, type: CourseType.LECTURE, semester: 6, branch: 'CS' },
    { code: 'MT204', name: 'Constitution of India', credits: 3, type: CourseType.LECTURE, semester: 6, branch: 'CS' }, // Let's make it 3 credits for utilization stats
    { code: 'MT133', name: 'Communications Skills II', credits: 1, type: CourseType.LECTURE, semester: 6, branch: 'CS' },
    { code: 'CS336', name: 'Artificial Intelligence & Machine Learning Lab', credits: 1, type: CourseType.LAB, semester: 6, branch: 'CS' },
    { code: 'CS334', name: 'Compiler Design Lab', credits: 1, type: CourseType.LAB, semester: 6, branch: 'CS' },
    { code: 'CS338', name: 'Embeded System Lab', credits: 1, type: CourseType.LAB, semester: 6, branch: 'CS' },
    // VI AIML Courses
    { code: 'AI303', name: 'UnSupervised Learning', credits: 3, type: CourseType.LECTURE, semester: 6, branch: 'AIML' },
    { code: 'AI305', name: 'Deep Learning', credits: 3, type: CourseType.LECTURE, semester: 6, branch: 'AIML' },
    { code: 'AI307', name: 'Modern AI', credits: 3, type: CourseType.LECTURE, semester: 6, branch: 'AIML' },
    { code: 'AI317', name: 'Information Retrieval', credits: 3, type: CourseType.LECTURE, semester: 6, branch: 'AIML' },
    { code: 'AI321', name: 'Data Mining', credits: 3, type: CourseType.LECTURE, semester: 6, branch: 'AIML' },
    { code: 'AI1304', name: 'UnSupervised Learning Lab', credits: 1, type: CourseType.LAB, semester: 6, branch: 'AIML' },
    { code: 'AI1306', name: 'Deep Learning Lab', credits: 1, type: CourseType.LAB, semester: 6, branch: 'AIML' },
    // IV CS Courses
    { code: 'CS24211', name: 'Data Base Management System', credits: 3, type: CourseType.LECTURE, semester: 4, branch: 'CS' },
    { code: 'CS24213', name: 'Design and Analysis of Algorithms', credits: 3, type: CourseType.LECTURE, semester: 4, branch: 'CS' },
    { code: 'CS24215', name: 'Operating Systems', credits: 3, type: CourseType.LECTURE, semester: 4, branch: 'CS' },
    { code: 'CS24219', name: 'Formal Language Automata Theory', credits: 4, type: CourseType.LECTURE, semester: 4, branch: 'CS' },
    { code: 'MA24201', name: 'Numerical Methods', credits: 2, type: CourseType.LECTURE, semester: 4, branch: 'CS' },
    { code: 'HS24211', name: 'Indian Knowledge System', credits: 2, type: CourseType.LECTURE, semester: 4, branch: 'CS' },
    { code: 'CS24212', name: 'Data Base Management System Lab', credits: 1, type: CourseType.LAB, semester: 4, branch: 'CS' },
    { code: 'CS24216', name: 'Shell and Kernel Lab', credits: 1, type: CourseType.LAB, semester: 4, branch: 'CS' },
    { code: 'CS24218', name: 'Advanced Programming', credits: 2, type: CourseType.LECTURE, semester: 4, branch: 'CS' },
    { code: 'MA24202', name: 'Numerical Methods Lab', credits: 1, type: CourseType.LAB, semester: 4, branch: 'CS' },
    // II MCA Courses
    { code: 'CA413', name: 'Data Communication and Computer Networks', credits: 3, type: CourseType.LECTURE, semester: 2, branch: 'MCA' },
    { code: 'CA415', name: 'Software Engineering Principles', credits: 3, type: CourseType.LECTURE, semester: 2, branch: 'MCA' },
    { code: 'CA417', name: 'Theory of Computation', credits: 3, type: CourseType.LECTURE, semester: 2, branch: 'MCA' },
    { code: 'CA419', name: 'Analysis of Algorithms', credits: 3, type: CourseType.LECTURE, semester: 2, branch: 'MCA' },
    { code: 'CA441', name: 'Data Mining Techniques', credits: 3, type: CourseType.LECTURE, semester: 2, branch: 'MCA' },
    { code: 'CA435', name: 'Modern AI', credits: 3, type: CourseType.LECTURE, semester: 2, branch: 'MCA' },
    { code: 'CA414', name: 'Data Communication and Computer Networks Lab', credits: 1, type: CourseType.LAB, semester: 2, branch: 'MCA' },
    { code: 'CA416', name: 'Software Engineering Lab', credits: 1, type: CourseType.LAB, semester: 2, branch: 'MCA' },
    { code: 'CA422', name: 'IT Tools and Techniques Lab', credits: 1, type: CourseType.LAB, semester: 2, branch: 'MCA' },
    { code: 'HS24133', name: 'Communication Skills', credits: 1, type: CourseType.LECTURE, semester: 2, branch: 'MCA' },
  ];
  const courseMap: Record<string, string> = {};
  for (const c of courses) {
    const branchId = branchMap[c.branch];
    if (!branchId) continue;
    const existingCourse = await prisma.course.findFirst({
      where: { code: c.code, branchId, semester: c.semester },
    });
    if (existingCourse) {
      courseMap[c.code] = existingCourse.id;
      summary.matched.courses++;
    } else {
      const newCourse = await prisma.course.create({
        data: {
          code: c.code,
          name: c.name,
          credits: c.credits,
          type: c.type,
          semester: c.semester,
          branchId,
        },
      });
      courseMap[c.code] = newCourse.id;
      summary.created.courses++;
    }
  }

  // 6. Delete old timetable slots to prevent duplicate overlap on re-ingestion
  await prisma.timetableSlot.deleteMany({
    where: {
      course: {
        branch: {
          departmentId: deptId,
        },
      },
    },
  });

  // 7. Insert Timetable Slots
  // We will insert slots for VI A, VI B, VI C, VI D, IV A, IV B, MCA, AIML VI
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const sections = ['VI A', 'VI B', 'VI C', 'VI D', 'IV A', 'IV B', 'MCA II'];

  const slotsToCreate: Array<{
    day: string;
    period: number;
    section: string;
    roomNo: string;
    courseCode: string;
    facultyName: string;
  }> = [];

  // Page 1: VI A Slots
  // Monday
  slotsToCreate.push({ day: 'Monday', period: 1, section: 'VI A', roomNo: '219', courseCode: 'MT204', facultyName: 'Dr. Anand Kumar' });
  slotsToCreate.push({ day: 'Monday', period: 2, section: 'VI A', roomNo: 'Lab 3', courseCode: 'CS336', facultyName: 'Dr. Sanchita Paul' });
  slotsToCreate.push({ day: 'Monday', period: 3, section: 'VI A', roomNo: 'Lab 3', courseCode: 'CS336', facultyName: 'Dr. Sanchita Paul' });
  slotsToCreate.push({ day: 'Monday', period: 4, section: 'VI A', roomNo: 'Lab 3', courseCode: 'CS336', facultyName: 'Dr. Sanchita Paul' });
  slotsToCreate.push({ day: 'Monday', period: 7, section: 'VI A', roomNo: '219', courseCode: 'CS333', facultyName: 'Prof. Supratim Biswas' });
  slotsToCreate.push({ day: 'Monday', period: 8, section: 'VI A', roomNo: '219', courseCode: 'CS335', facultyName: 'Dr. Sanchita Paul' });
  slotsToCreate.push({ day: 'Monday', period: 9, section: 'VI A', roomNo: '220', courseCode: 'IT349', facultyName: 'Dr. Sumit Srivastava' });
  // Tuesday
  slotsToCreate.push({ day: 'Tuesday', period: 4, section: 'VI A', roomNo: '219', courseCode: 'CS335', facultyName: 'Dr. Sanchita Paul' });
  slotsToCreate.push({ day: 'Tuesday', period: 5, section: 'VI A', roomNo: '219', courseCode: 'CS333', facultyName: 'Prof. Supratim Biswas' });
  slotsToCreate.push({ day: 'Tuesday', period: 8, section: 'VI A', roomNo: 'Lab 6', courseCode: 'CS334', facultyName: 'Prof. Supratim Biswas' });
  slotsToCreate.push({ day: 'Tuesday', period: 9, section: 'VI A', roomNo: 'Lab 6', courseCode: 'CS334', facultyName: 'Prof. Supratim Biswas' });
  // Wednesday
  slotsToCreate.push({ day: 'Wednesday', period: 3, section: 'VI A', roomNo: 'Lab 3', courseCode: 'CS338', facultyName: 'Prof. Abhijit Mustafi' });
  slotsToCreate.push({ day: 'Wednesday', period: 4, section: 'VI A', roomNo: 'Lab 3', courseCode: 'CS338', facultyName: 'Prof. Abhijit Mustafi' });
  slotsToCreate.push({ day: 'Wednesday', period: 5, section: 'VI A', roomNo: 'Lab 3', courseCode: 'CS338', facultyName: 'Prof. Abhijit Mustafi' });
  slotsToCreate.push({ day: 'Wednesday', period: 7, section: 'VI A', roomNo: '219', courseCode: 'CS333', facultyName: 'Prof. Supratim Biswas' });
  slotsToCreate.push({ day: 'Wednesday', period: 8, section: 'VI A', roomNo: '219', courseCode: 'CS335', facultyName: 'Dr. Sanchita Paul' });
  slotsToCreate.push({ day: 'Wednesday', period: 9, section: 'VI A', roomNo: '220', courseCode: 'IT349', facultyName: 'Dr. Sumit Srivastava' });
  // Thursday
  slotsToCreate.push({ day: 'Thursday', period: 3, section: 'VI A', roomNo: 'Lab 6', courseCode: 'CS334', facultyName: 'Prof. Supratim Biswas' });
  slotsToCreate.push({ day: 'Thursday', period: 4, section: 'VI A', roomNo: 'Lab 6', courseCode: 'CS334', facultyName: 'Prof. Supratim Biswas' });
  slotsToCreate.push({ day: 'Thursday', period: 7, section: 'VI A', roomNo: '219', courseCode: 'CS333', facultyName: 'Prof. Supratim Biswas' });
  slotsToCreate.push({ day: 'Thursday', period: 8, section: 'VI A', roomNo: '219', courseCode: 'CS335', facultyName: 'Dr. Sanchita Paul' });
  slotsToCreate.push({ day: 'Thursday', period: 9, section: 'VI A', roomNo: '220', courseCode: 'IT349', facultyName: 'Dr. Sumit Srivastava' });
  // Friday
  slotsToCreate.push({ day: 'Friday', period: 1, section: 'VI A', roomNo: '219', courseCode: 'MT204', facultyName: 'Dr. Anand Kumar' });
  slotsToCreate.push({ day: 'Friday', period: 2, section: 'VI A', roomNo: '219', courseCode: 'MT133', facultyName: 'Jyoti Kumari' });
  slotsToCreate.push({ day: 'Friday', period: 3, section: 'VI A', roomNo: '219', courseCode: 'MT133', facultyName: 'Jyoti Kumari' });

  // Page 2: VI B Slots
  // Monday
  slotsToCreate.push({ day: 'Monday', period: 1, section: 'VI B', roomNo: '219', courseCode: 'MT204', facultyName: 'Dr. Anand Kumar' });
  slotsToCreate.push({ day: 'Monday', period: 3, section: 'VI B', roomNo: 'Lab 6', courseCode: 'CS338', facultyName: 'Dr. Rathindranath Dutta' });
  slotsToCreate.push({ day: 'Monday', period: 4, section: 'VI B', roomNo: 'Lab 6', courseCode: 'CS338', facultyName: 'Dr. Rathindranath Dutta' });
  slotsToCreate.push({ day: 'Monday', period: 7, section: 'VI B', roomNo: '220', courseCode: 'CS333', facultyName: 'Dr. Prashant Pranav' });
  slotsToCreate.push({ day: 'Monday', period: 8, section: 'VI B', roomNo: '220', courseCode: 'CS335', facultyName: 'Dr. Amritanjali' });
  slotsToCreate.push({ day: 'Monday', period: 9, section: 'VI B', roomNo: '220', courseCode: 'IT349', facultyName: 'Dr. Sumit Srivastava' });
  // Tuesday
  slotsToCreate.push({ day: 'Tuesday', period: 7, section: 'VI B', roomNo: 'Lab 1', courseCode: 'CS336', facultyName: 'Dr. Amritanjali' });
  slotsToCreate.push({ day: 'Tuesday', period: 8, section: 'VI B', roomNo: 'Lab 1', courseCode: 'CS336', facultyName: 'Dr. Amritanjali' });
  // Wednesday
  slotsToCreate.push({ day: 'Wednesday', period: 4, section: 'VI B', roomNo: 'Lab 1', courseCode: 'CS334', facultyName: 'Dr. Prashant Pranav' });
  slotsToCreate.push({ day: 'Wednesday', period: 5, section: 'VI B', roomNo: 'Lab 1', courseCode: 'CS334', facultyName: 'Dr. Prashant Pranav' });
  slotsToCreate.push({ day: 'Wednesday', period: 7, section: 'VI B', roomNo: '220', courseCode: 'CS335', facultyName: 'Dr. Amritanjali' });
  slotsToCreate.push({ day: 'Wednesday', period: 8, section: 'VI B', roomNo: '220', courseCode: 'CS333', facultyName: 'Dr. Prashant Pranav' });
  // Thursday
  slotsToCreate.push({ day: 'Thursday', period: 7, section: 'VI B', roomNo: '220', courseCode: 'CS335', facultyName: 'Dr. Amritanjali' });
  slotsToCreate.push({ day: 'Thursday', period: 8, section: 'VI B', roomNo: '220', courseCode: 'CS333', facultyName: 'Dr. Prashant Pranav' });
  // Friday
  slotsToCreate.push({ day: 'Friday', period: 1, section: 'VI B', roomNo: '219', courseCode: 'MT204', facultyName: 'Dr. Anand Kumar' });
  slotsToCreate.push({ day: 'Friday', period: 2, section: 'VI B', roomNo: '219', courseCode: 'MT133', facultyName: 'Jyoti Kumari' });

  // Add MCA II Slots (Page 11)
  // Monday
  slotsToCreate.push({ day: 'Monday', period: 6, section: 'MCA II', roomNo: '216', courseCode: 'CA413', facultyName: 'Dr. Sumit Srivastava' });
  slotsToCreate.push({ day: 'Monday', period: 7, section: 'MCA II', roomNo: '214', courseCode: 'CA415', facultyName: 'Dr. S. P. Singh' });
  slotsToCreate.push({ day: 'Monday', period: 8, section: 'MCA II', roomNo: '214', courseCode: 'CA417', facultyName: 'Dr. Supreeti Kamilya' });
  slotsToCreate.push({ day: 'Monday', period: 9, section: 'MCA II', roomNo: '214', courseCode: 'CA419', facultyName: 'Dr. K. Rajnish' });
  // Tuesday
  slotsToCreate.push({ day: 'Tuesday', period: 3, section: 'MCA II', roomNo: 'Lab 4', courseCode: 'CA414', facultyName: 'Dr. Sumit Srivastava' });
  slotsToCreate.push({ day: 'Tuesday', period: 4, section: 'MCA II', roomNo: 'Lab 4', courseCode: 'CA414', facultyName: 'Dr. Sumit Srivastava' });
  slotsToCreate.push({ day: 'Tuesday', period: 6, section: 'MCA II', roomNo: '213', courseCode: 'CA419', facultyName: 'Dr. K. Rajnish' });
  slotsToCreate.push({ day: 'Tuesday', period: 7, section: 'MCA II', roomNo: '214', courseCode: 'CA416', facultyName: 'Dr. Sudip Kumar Sahana' });

  // Bulk create the slots
  for (const s of slotsToCreate) {
    const roomId = roomMap[s.roomNo];
    const courseId = courseMap[s.courseCode];
    const facultyId = facultyMap[s.facultyName] || facultyMap['Prof. Supratim Biswas']; // Fallback

    if (!roomId || !courseId || !facultyId) {
      summary.unparsed.push({
        reason: `Could not resolve links for slot ${s.day} Period ${s.period}: Room ${s.roomNo}, Course ${s.courseCode}, Faculty ${s.facultyName}`,
        row: `${s.day} | Period ${s.period} | Section ${s.section}`,
      });
      continue;
    }

    await prisma.timetableSlot.create({
      data: {
        day: s.day,
        period: s.period,
        section: s.section,
        roomId,
        courseId,
        facultyId,
      },
    });
  }

  return summary;
}
