import { store } from '../store.js';
import { toKhmerNum, getGradeDetails } from '../utils/khmerNumbers.js';

export function renderAdminGradingView(params = {}) {
  const courses = store.getCourses(true);
  const students = store.getStudents();
  const targetStudentId = params.targetStudentId || null;

  return `
    <div class="container" style="padding: 30px 24px 60px;">
      <div class="admin-header">
        <div>
          <div class="badge badge-gold" style="margin-bottom: 6px;">📊 Grading & Evaluation</div>
          <h1 style="font-size: 26px;">ប្រព័ន្ធដាក់ពិន្ទុ និងវាយតម្លៃសិស្ស (Student Grading)</h1>
          <p style="color: var(--text-muted); font-size: 14px;">
            បញ្ចូលពិន្ទុវត្តមាន កិច្ចការ និងការប្រឡងបញ្ចប់។ ប្រព័ន្ធនឹងគណនាពិន្ទុសរុប និងនិទ្ទេសដោយស្វ័យប្រវត្តិដើម្បីចេញវិញ្ញាបនបត្រ។
          </p>
        </div>
      </div>

      <!-- Admin Tab Bar -->
      <div style="margin-bottom: 24px;">
        <div class="admin-tabs">
          <button class="admin-tab-btn" id="tabCourses3">
            <span>📚 បញ្ជីវគ្គសិក្សា</span>
          </button>
          <button class="admin-tab-btn" id="tabStudents3">
            <span>👥 បញ្ជីសិស្សចុះឈ្មោះ</span>
          </button>
          <button class="admin-tab-btn active" id="tabGrading3">
            <span>📝 ដាក់ពិន្ទុ & វាយតម្លៃសិស្ស</span>
          </button>
          <button class="admin-tab-btn" id="tabCertificates3">
            <span>🏆 វិញ្ញាបនបត្របែបខ្មែរ</span>
          </button>
        </div>
      </div>

      <!-- Course Selector for Grading -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 26px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <label style="font-weight: 600; font-size: 15px; color: #fff;">ជ្រើសរើសវគ្គសិក្សាដើម្បីដាក់ពិន្ទុ៖</label>
          <select id="gradingCourseFilter" class="form-control" style="width: auto; min-width: 320px;">
            <option value="all">គ្រប់វគ្គសិក្សាទាំងអស់ (${toKhmerNum(students.length)} នាក់)</option>
            ${courses.map(c => {
              const count = students.filter(s => s.courseId === c.id).length;
              return `<option value="${c.id}">${c.code} - ${c.titleKh} (${toKhmerNum(count)} នាក់)</option>`;
            }).join('')}
          </select>
        </div>

        <div style="display: flex; gap: 8px;">
          <span class="badge badge-success">A: 85-100 (ល្អប្រសើរ)</span>
          <span class="badge badge-primary">B: 75-84 (ល្អណាស់)</span>
          <span class="badge badge-warning">C: 65-74 (ល្អ)</span>
          <span class="badge badge-danger">F: < 50 (ធ្លាក់)</span>
        </div>
      </div>

      <!-- Grading Table -->
      <div class="table-responsive">
        <table class="data-table" id="gradingStudentsTable">
          <thead>
            <tr>
              <th>អត្តលេខ</th>
              <th>ឈ្មោះសិស្ស</th>
              <th>វគ្គសិក្សា</th>
              <th>វត្តមាន (២០%)</th>
              <th>កិច្ចការ (៣០%)</th>
              <th>ប្រឡង (៥០%)</th>
              <th>សរុប (១០០)</th>
              <th>និទ្ទេស</th>
              <th>វិញ្ញាបនបត្រ</th>
              <th style="text-align: right;">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody id="gradingStudentsTableBody">
            ${students.map(s => {
              const course = store.getCourseById(s.courseId);
              const g = s.grades;
              return `
                <tr data-student-id="${s.id}" data-course-id="${s.courseId}">
                  <td style="font-family: var(--font-latin); font-weight: 700; color: var(--gold-300);">${s.id}</td>
                  <td>
                    <div style="font-weight: 700; color: #fff;">${s.nameKh}</div>
                    <div style="font-size: 11.5px; color: var(--text-dim); font-family: var(--font-latin);">${s.nameEn}</div>
                  </td>
                  <td>
                    <div style="font-size: 13px;">${course ? course.code : ''}</div>
                  </td>
                  <td>
                    ${g ? `${toKhmerNum(g.attendance)} / ២០` : '<span style="color: var(--text-dim);">-</span>'}
                  </td>
                  <td>
                    ${g ? `${toKhmerNum(g.homework)} / ៣០` : '<span style="color: var(--text-dim);">-</span>'}
                  </td>
                  <td>
                    ${g ? `${toKhmerNum(g.exam)} / ៥០` : '<span style="color: var(--text-dim);">-</span>'}
                  </td>
                  <td>
                    ${g ? `
                      <span style="font-family: var(--font-latin); font-size: 16px; font-weight: 800; color: ${g.passed ? '#34d399' : '#f87171'};">
                        ${g.totalScore}
                      </span>
                    ` : '<span style="color: var(--text-dim);">-</span>'}
                  </td>
                  <td>
                    ${g ? `
                      <span class="badge ${g.passed ? 'badge-success' : 'badge-danger'}">
                        ${g.gradeKh}
                      </span>
                    ` : `
                      <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-dim);">មិនទាន់វាយតម្លៃ</span>
                    `}
                  </td>
                  <td>
                    ${g && g.passed ? `
                      <button class="btn btn-gold btn-sm open-cert-from-grade-btn" data-id="${s.id}">
                        <span>🏆 ចេញវិញ្ញាបនបត្រ</span>
                      </button>
                    ` : `
                      <span style="font-size: 12px; color: var(--text-dim);">ត្រូវការជាប់សិន</span>
                    `}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-outline btn-sm open-grade-modal-btn" data-id="${s.id}">
                      <span>✏️ ដាក់ពិន្ទុ</span>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Grading Modal Dialog -->
      <div class="modal-backdrop" id="gradeEntryModal">
        <div class="modal-content" style="max-width: 550px;">
          <div class="modal-header">
            <h3 class="modal-title">
              <span>📝 ដាក់ពិន្ទុសិស្ស</span>
            </h3>
            <button class="modal-close-btn" id="closeGradeModalBtn">✕</button>
          </div>

          <div id="gradeModalStudentHeader" style="background: rgba(255,255,255,0.04); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 20px; border-left: 3px solid var(--gold-400);">
            <!-- Student basic info -->
          </div>

          <form id="saveStudentGradeForm">
            <input type="hidden" id="gradeStudentId" value="" />

            <div class="form-group">
              <label class="form-label" for="inputAttendanceScore">
                ១. ពិន្ទុវត្តមាន & ការចូលរួម (Attendance) - អតិបរមា ២០ ពិន្ទុ <span class="req">*</span>
              </label>
              <input type="number" id="inputAttendanceScore" class="form-control" min="0" max="20" step="0.5" placeholder="0 - 20" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="inputHomeworkScore">
                ២. ពិន្ទុកិច្ចការផ្ទះ & Assignment - អតិបរមា ៣០ ពិន្ទុ <span class="req">*</span>
              </label>
              <input type="number" id="inputHomeworkScore" class="form-control" min="0" max="30" step="0.5" placeholder="0 - 30" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="inputExamScore">
                ៣. ពិន្ទុការប្រឡងបញ្ចប់វគ្គ (Final Exam) - អតិបរមា ៥០ ពិន្ទុ <span class="req">*</span>
              </label>
              <input type="number" id="inputExamScore" class="form-control" min="0" max="50" step="0.5" placeholder="0 - 50" required />
            </div>

            <!-- Live Score Calculation Preview -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 14px; color: var(--text-muted);">ពិន្ទុសរុប (Total Score):</span>
                <span id="previewTotalScore" style="font-size: 24px; font-weight: 800; color: #fff; font-family: var(--font-latin);">0 / 100</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; color: var(--text-muted);">និទ្ទេសដែលទទួលបាន (Grade):</span>
                <span id="previewGradeBadge" class="badge" style="background: rgba(255,255,255,0.06); font-size: 14px;">-</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="inputGradeRemarks">មតិយោបល់របស់សាស្ត្រាចារ្យ (Instructor Comments)</label>
              <textarea id="inputGradeRemarks" class="form-control" placeholder="ឧ. សិស្សមានការយល់ដឹងច្បាស់លាស់ និងអនុវត្ត Project បានល្អ..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-subtle);">
              <button type="button" class="btn btn-outline" id="cancelGradeModalBtn">បោះបង់</button>
              <button type="submit" class="btn btn-gold">
                <span>💾 រក្សាទុកពិន្ទុ & វាយតម្លៃ</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function initAdminGradingEvents(onNavigate, showToast, targetStudentId) {
  // Navigation Tabs
  document.getElementById('tabCourses3')?.addEventListener('click', () => onNavigate('admin-courses'));
  document.getElementById('tabStudents3')?.addEventListener('click', () => onNavigate('admin-students'));
  document.getElementById('tabCertificates3')?.addEventListener('click', () => onNavigate('certificate', { studentId: 'STU-2026-001' }));

  const modal = document.getElementById('gradeEntryModal');
  const gradeForm = document.getElementById('saveStudentGradeForm');
  const studentHeader = document.getElementById('gradeModalStudentHeader');
  const gradeStudentId = document.getElementById('gradeStudentId');

  const attInput = document.getElementById('inputAttendanceScore');
  const hwInput = document.getElementById('inputHomeworkScore');
  const exInput = document.getElementById('inputExamScore');
  const totalPreview = document.getElementById('previewTotalScore');
  const gradeBadgePreview = document.getElementById('previewGradeBadge');

  function updateLiveCalculation() {
    const att = parseFloat(attInput.value) || 0;
    const hw = parseFloat(hwInput.value) || 0;
    const ex = parseFloat(exInput.value) || 0;
    const total = Math.round((att + hw + ex) * 10) / 10;

    totalPreview.innerText = `${total} / 100`;

    const details = getGradeDetails(total);
    gradeBadgePreview.innerText = `${details.grade} - ${details.titleKh}`;
    gradeBadgePreview.className = `badge ${details.status === 'Passed' ? 'badge-success' : 'badge-danger'}`;
  }

  attInput?.addEventListener('input', updateLiveCalculation);
  hwInput?.addEventListener('input', updateLiveCalculation);
  exInput?.addEventListener('input', updateLiveCalculation);

  // Function to open modal for student
  function openGradeModal(studentId) {
    const student = store.getStudentById(studentId);
    if (!student) return;

    const course = store.getCourseById(student.courseId);

    gradeStudentId.value = student.id;
    studentHeader.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: #fff; font-size: 16px;">${student.nameKh}</strong> 
          <span style="font-family: var(--font-latin); color: var(--gold-300); font-weight: 600;">(${student.nameEn})</span>
          <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
            អត្តលេខ៖ ${student.id} | វគ្គ៖ ${course ? course.titleKh : ''}
          </div>
        </div>
        <img src="${student.photoUrl}" style="width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--gold-400);" />
      </div>
    `;

    // Fill existing grades if present
    if (student.grades) {
      attInput.value = student.grades.attendance;
      hwInput.value = student.grades.homework;
      exInput.value = student.grades.exam;
      document.getElementById('inputGradeRemarks').value = student.grades.remarks || '';
    } else {
      attInput.value = '18';
      hwInput.value = '25';
      exInput.value = '42';
      document.getElementById('inputGradeRemarks').value = 'សិស្សបានខិតខំប្រឹងប្រែង និងបញ្ចប់កិច្ចការបានល្អ';
    }

    updateLiveCalculation();
    modal?.classList.add('open');
  }

  // Open modal button handlers in table
  document.querySelectorAll('.open-grade-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.currentTarget.getAttribute('data-id');
      openGradeModal(studentId);
    });
  });

  // Open Certificate from Grade Table
  document.querySelectorAll('.open-cert-from-grade-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.currentTarget.getAttribute('data-id');
      onNavigate('certificate', { studentId });
    });
  });

  // If redirected with targetStudentId, open modal immediately
  if (targetStudentId) {
    openGradeModal(targetStudentId);
  }

  // Close modal
  document.getElementById('closeGradeModalBtn')?.addEventListener('click', () => modal?.classList.remove('open'));
  document.getElementById('cancelGradeModalBtn')?.addEventListener('click', () => modal?.classList.remove('open'));

  // Save Grades Form Submit
  gradeForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = gradeStudentId.value;

    const student = store.saveStudentGrades(studentId, {
      attendance: attInput.value,
      homework: hwInput.value,
      exam: exInput.value,
      remarks: document.getElementById('inputGradeRemarks').value
    });

    showToast(`បានបញ្ចូលពិន្ទុសម្រាប់សិស្ស ${student.nameKh} ជោគជ័យ! (${student.grades.gradeKh})`, 'success');
    modal?.classList.remove('open');
    onNavigate('admin-grading');
  });

  // Filter by Course
  const courseFilter = document.getElementById('gradingCourseFilter');
  courseFilter?.addEventListener('change', (e) => {
    const courseId = e.currentTarget.value;
    const rows = document.querySelectorAll('#gradingStudentsTableBody tr');

    rows.forEach(row => {
      const rowCourseId = row.getAttribute('data-course-id');
      if (courseId === 'all' || rowCourseId === courseId) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
}
