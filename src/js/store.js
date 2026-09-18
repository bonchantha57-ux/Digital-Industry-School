/**
 * Central State & LocalStorage Store
 * Updated for Digital Industry & Trainer Mr. Born Chantha (លោក ប៊ន ចន្ថា)
 */

import { getGradeDetails } from './utils/khmerNumbers.js';
import { db, auth, signInWithEmailAndPassword, signOut, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, isFirebaseConfigured, query, where } from './firebase.js';

const STORAGE_KEYS = {
  COURSES: 'digital_industry_courses_v2',
  STUDENTS: 'digital_industry_students_v2',
  SETTINGS: 'digital_industry_settings_v2',
  AUTH: 'digital_industry_auth_v2'
};

// No fake courses: courses are created and managed by Admin only
const INITIAL_COURSES = [];

// No fake students: real students are created through registration or Admin entry
const INITIAL_STUDENTS = [];

const INITIAL_SETTINGS = {
  instituteNameKh: 'មជ្ឈមណ្ឌលបណ្តុះបណ្តាល Digital Industry',
  instituteNameEn: 'DIGITAL INDUSTRY TRAINING CENTER',
  directorName: 'លោក ប៊ន ចន្ថា',
  directorTitle: 'គ្រូបណ្តុះបណ្តាល (Training Instructor)',
  trainerNameKh: 'លោក ប៊ន ចន្ថា',
  trainerNameEn: 'BORN CHANTHA',
  phone: '012 889 900 / 098 556 677',
  email: 'digitalindustry.training@gmail.com',
  address: 'រាជធានីភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា',
  logoUrl: '/assets/digital-industry-logo-round.png'
};

class DataStore {
  constructor() {
    this.init();
  }

  init() {
    // Purge old mock/fake courses so courses do NOT appear by themselves
    if (localStorage.getItem('di_fake_courses_purged_v2') !== 'true') {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
      localStorage.setItem('di_fake_courses_purged_v2', 'true');
    }

    // Purge old mock/fake students so the database starts clean
    if (localStorage.getItem('di_fake_students_purged') !== 'true') {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
      localStorage.setItem('di_fake_students_purged', 'true');
    }

    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }

    // Sync live from Firestore if Firebase project is connected
    this.syncFromFirestore();
  }

  // --- Live Firestore Cloud Synchronization ---
  async syncFromFirestore() {
    if (!isFirebaseConfigured() || !db) return;
    try {
      // Sync courses collection from Firestore
      const coursesSnap = await getDocs(collection(db, 'courses'));
      if (!coursesSnap.empty) {
        const remoteCourses = [];
        coursesSnap.forEach(d => remoteCourses.push({ ...d.data(), id: d.id }));
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(remoteCourses));
      }

      // Sync students collection from Firestore
      const studentsSnap = await getDocs(collection(db, 'students'));
      if (!studentsSnap.empty) {
        const remoteStudents = [];
        studentsSnap.forEach(d => remoteStudents.push({ ...d.data(), id: d.id }));
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(remoteStudents));
      }
    } catch (err) {
      console.warn('ℹ️ Firestore sync (offline or permission pending):', err);
    }
  }

  // --- Admin Auth & Session Management ---
  isAdminLoggedIn() {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return false;
    try {
      const session = JSON.parse(raw);
      return Boolean(session && session.isLoggedIn);
    } catch (e) {
      return false;
    }
  }

  getAdminSession() {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  async loginAdmin(username, password) {
    const rawUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    // Auto append domain if user enters 'admin' or 'admin@digital'
    let emailToUse = rawUser;
    if (rawUser.toLowerCase() === 'admin') {
      emailToUse = 'admin@digital.com';
    } else if (!rawUser.includes('@')) {
      emailToUse = `${rawUser}@digital.com`;
    }

    // Attempt Firebase Authentication first if Firebase is configured
    if (isFirebaseConfigured() && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailToUse, cleanPass);
        const session = {
          isLoggedIn: true,
          username: 'លោកគ្រូ ប៊ន ចន្ថា (Born Chantha)',
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          role: 'Super Admin',
          provider: 'Firebase Auth Live',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
        return { success: true, session };
      } catch (fbErr) {
        console.warn('Firebase Auth Login Attempt failed:', fbErr.code, fbErr.message);
        
        // If Firebase Auth returned invalid credentials, report exact error
        if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(fbErr.code)) {
          return {
            success: false,
            message: `⚠️ ការចូលប្រើប្រាស់បរាជ័យ៖ អ៊ីមែល (${emailToUse}) ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវក្នុងប្រព័ន្ធ Firebase ឡើយ!`
          };
        }
      }
    }

    // Local Fallback Credentials Check
    const cleanUser = rawUser.toLowerCase();
    const validUsers = ['admin', 'admin@digital.com', 'admin@digitalindustry.edu.kh', 'bornchantha', '012889900'];
    const validPasswords = ['admin123', '123456', 'bornchantha', 'di2026'];

    if (validUsers.includes(cleanUser) && validPasswords.includes(cleanPass)) {
      const session = {
        isLoggedIn: true,
        username: 'លោកគ្រូ ប៊ន ចន្ថា',
        email: emailToUse,
        role: 'Super Admin',
        provider: 'Local Store Fallback',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
      return { success: true, session };
    }

    return { 
      success: false, 
      message: 'ឈ្មោះអ្នកប្រើប្រាស់ ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ!' 
    };
  }

  logoutAdmin() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    if (isFirebaseConfigured() && auth) {
      signOut(auth).catch(e => console.warn('Firebase SignOut:', e));
    }
    return true;
  }

  clearAllStudents() {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    return [];
  }

  // --- Courses Methods ---
  getCourses(includeUnpublished = false) {
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    const courses = raw ? JSON.parse(raw) : [];
    if (includeUnpublished) return courses;
    return courses.filter(c => c.status === 'published');
  }

  getCourseById(id) {
    const courses = this.getCourses(true);
    return courses.find(c => c.id === id);
  }

  addCourse(courseData) {
    const courses = this.getCourses(true);
    const newId = `CRS-${String(courses.length + 1).padStart(3, '0')}`;
    const newCourse = {
      id: newId,
      code: courseData.code || `DI-${Date.now().toString().slice(-4)}`,
      titleKh: courseData.titleKh,
      titleEn: courseData.titleEn || courseData.titleKh,
      category: courseData.category || 'វគ្គខ្លី',
      instructor: courseData.instructor || 'លោកគ្រូ ប៊ន ចន្ថា (Born Chantha)',
      hours: parseInt(courseData.hours, 10) || 30,
      fee: parseFloat(courseData.fee) || 0,
      maxSeats: parseInt(courseData.maxSeats, 10) || 25,
      schedule: courseData.schedule || 'តាមការកំណត់',
      description: courseData.description || '',
      status: courseData.status || 'published',
      badge: courseData.badge || 'វគ្គខ្លីថ្មី',
      createdAt: new Date().toISOString().split('T')[0]
    };
    courses.unshift(newCourse);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));

    // Async write to Firestore if connected
    if (isFirebaseConfigured() && db) {
      setDoc(doc(db, 'courses', newId), newCourse).catch(e => console.warn('Firestore addCourse:', e));
    }

    return newCourse;
  }

  updateCourse(id, updateData) {
    const courses = this.getCourses(true);
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) return null;

    courses[index] = {
      ...courses[index],
      ...updateData,
      hours: parseInt(updateData.hours || courses[index].hours, 10),
      fee: parseFloat(updateData.fee ?? courses[index].fee),
      maxSeats: parseInt(updateData.maxSeats || courses[index].maxSeats, 10),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));

    // Async update to Firestore if connected
    if (isFirebaseConfigured() && db) {
      setDoc(doc(db, 'courses', id), courses[index], { merge: true }).catch(e => console.warn('Firestore updateCourse:', e));
    }

    return courses[index];
  }

  deleteCourse(id) {
    let courses = this.getCourses(true);
    courses = courses.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));

    if (isFirebaseConfigured() && db) {
      deleteDoc(doc(db, 'courses', id)).catch(e => console.warn('Firestore deleteCourse:', e));
    }

    return true;
  }

  // --- Students Methods ---
  getStudents(filter = {}) {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    let students = raw ? JSON.parse(raw) : [];

    if (filter.courseId && filter.courseId !== 'all') {
      students = students.filter(s => s.courseId === filter.courseId);
    }
    if (filter.status && filter.status !== 'all') {
      students = students.filter(s => s.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      students = students.filter(s =>
        s.nameKh.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.phone.includes(q)
      );
    }

    return students;
  }

  getStudentById(id) {
    const students = this.getStudents();
    return students.find(s => s.id === id);
  }

  registerStudent(studentData) {
    const students = this.getStudents();
    const currentYear = new Date().getFullYear();
    const newSeq = String(students.length + 1).padStart(3, '0');
    const newId = `DI-${currentYear}-${newSeq}`;

    const newStudent = {
      id: newId,
      nameKh: studentData.nameKh.trim(),
      nameEn: studentData.nameEn ? studentData.nameEn.trim().toUpperCase() : studentData.nameKh.trim(),
      gender: studentData.gender || 'ប្រុស',
      dob: studentData.dob || '',
      phone: studentData.phone.trim(),
      email: studentData.email ? studentData.email.trim() : '',
      address: studentData.address || 'រាជធានីភ្នំពេញ',
      courseId: studentData.courseId,
      shift: studentData.shift || 'វេនយប់ (៦:០០ - ៧:៣០ យប់)',
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      photoUrl: studentData.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentData.nameEn || studentData.nameKh)}`,
      grades: null,
      certificate: null
    };

    students.unshift(newStudent);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    // Async write to Firestore students collection
    if (isFirebaseConfigured() && db) {
      setDoc(doc(db, 'students', newId), newStudent).catch(e => console.warn('Firestore registerStudent:', e));
    }

    return newStudent;
  }

  updateStudent(id, updateData) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) return null;

    students[index] = {
      ...students[index],
      ...updateData,
      nameEn: updateData.nameEn ? updateData.nameEn.toUpperCase() : students[index].nameEn
    };

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    if (isFirebaseConfigured() && db) {
      setDoc(doc(db, 'students', id), students[index], { merge: true }).catch(e => console.warn('Firestore updateStudent:', e));
    }

    return students[index];
  }

  deleteStudent(id) {
    let students = this.getStudents();
    students = students.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    if (isFirebaseConfigured() && db) {
      deleteDoc(doc(db, 'students', id)).catch(e => console.warn('Firestore deleteStudent:', e));
    }

    return true;
  }

  // --- Grading Methods ---
  saveStudentGrades(studentId, { attendance, homework, exam, remarks }) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index === -1) return null;

    const attScore = Math.min(20, Math.max(0, parseFloat(attendance) || 0));
    const hwScore = Math.min(30, Math.max(0, parseFloat(homework) || 0));
    const exScore = Math.min(50, Math.max(0, parseFloat(exam) || 0));
    const totalScore = Math.round((attScore + hwScore + exScore) * 10) / 10;

    const gradeInfo = getGradeDetails(totalScore);

    const grades = {
      attendance: attScore,
      homework: hwScore,
      exam: exScore,
      totalScore,
      gradeLetter: gradeInfo.grade,
      gradeKh: gradeInfo.titleKh,
      gradeEn: gradeInfo.titleEn,
      gpa: gradeInfo.gpa,
      passed: gradeInfo.status === 'Passed',
      gradedAt: new Date().toISOString().split('T')[0],
      remarks: remarks || ''
    };

    students[index].grades = grades;

    if (grades.passed && students[index].status === 'enrolled') {
      students[index].status = 'graduated';
    }

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    if (isFirebaseConfigured() && db) {
      setDoc(doc(db, 'students', studentId), students[index], { merge: true }).catch(e => console.warn('Firestore grades:', e));
    }

    return students[index];
  }

  // --- Certificate Generation Methods ---
  generateCertificate(studentId, customOptions = {}) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index === -1) return null;

    const student = students[index];
    if (!student.grades || !student.grades.passed) {
      throw new Error('សិស្សនេះមិនទាន់មានពិន្ទុជាប់ ឬមិនទាន់បានដាក់ពិន្ទុនៅឡើយទេ!');
    }

    const currentYear = new Date().getFullYear();
    const randomCertId = `CERT-DI-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
    const settings = this.getSettings();

    const certData = {
      certificateNo: student.certificate?.certificateNo || randomCertId,
      issueDate: customOptions.issueDate || new Date().toISOString().split('T')[0],
      theme: customOptions.theme || student.certificate?.theme || 'gold',
      directorName: settings.directorName, // 'លោក ប៊ន ចន្ថា'
      directorTitle: settings.directorTitle, // 'គ្រូបណ្តុះបណ្តាល (Training Instructor)'
      instituteNameKh: settings.instituteNameKh,
      instituteNameEn: settings.instituteNameEn,
      createdTimestamp: Date.now()
    };

    student.certificate = certData;
    student.status = 'graduated';

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    if (isFirebaseConfigured() && db) {
      setDoc(doc(db, 'students', studentId), student, { merge: true }).catch(e => console.warn('Firestore cert:', e));
    }

    return { student, certificate: certData };
  }

  // --- Settings & Diagnostics Methods ---
  getSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS;
  }

  updateSettings(newSettings) {
    const settings = { ...this.getSettings(), ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return true;
  }

  exportDataAsJSON() {
    return JSON.stringify({
      courses: this.getCourses(true),
      students: this.getStudents(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  importDataFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.courses) localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(data.courses));
      if (data.students) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}

export const store = new DataStore();
