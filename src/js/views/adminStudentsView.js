import { store } from '../store.js';
import { toKhmerNum } from '../utils/khmerNumbers.js';

export function renderAdminStudentsView() {
  const students = store.getStudents();
  const courses = store.getCourses(true);

  return `
    <div class="container" style="padding: 30px 24px 60px;">
      <div class="admin-header">
        <div>
          <div class="badge badge-gold" style="margin-bottom: 6px;">👥 Student Management</div>
          <h1 style="font-size: 26px;">គ្រប់គ្រងបញ្ជីសិស្ស (Registered Students)</h1>
          <p style="color: var(--text-muted); font-size: 14px;">
            ត្រួតពិនិត្យសិស្សដែលបានចុះឈ្មោះ បញ្ជាក់ការចូលរៀន (Approve) និងត្រៀមដាក់ពិន្ទុ។
          </p>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm" id="clearAllFakeStudentsBtn" style="border-color: #EF4444; color: #F87171;" title="លុបទិន្នន័យសិស្ស Fake ចោលទាំងអស់">
            <span>🗑️ សម្អាតទិន្នន័យ Fake ចោល</span>
          </button>
          <button class="btn btn-gold btn-sm" id="openAddStudentModalBtn">
            <span>➕ បញ្ចូលសិស្សដោយផ្ទាល់</span>
          </button>
        </div>
      </div>

      <!-- Admin Tab Bar -->
      <div style="margin-bottom: 24px;">
        <div class="admin-tabs">
          <button class="admin-tab-btn" id="tabCourses2">
            <span>📚 បញ្ជីវគ្គសិក្សា (${toKhmerNum(courses.length)})</span>
          </button>
          <button class="admin-tab-btn active" id="tabStudents2">
            <span>👥 បញ្ជីសិស្សចុះឈ្មោះ (${toKhmerNum(students.length)})</span>
          </button>
          <button class="admin-tab-btn" id="tabGrading2">
            <span>📝 ដាក់ពិន្ទុ & វាយតម្លៃសិស្ស</span>
          </button>
          <button class="admin-tab-btn" id="tabCertificates2">
            <span>🏆 វិញ្ញាបនបត្របែបខ្មែរ</span>
          </button>
        </div>
      </div>

      <!-- Student Stats -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px;">
          <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 4px;">សិស្សចុះឈ្មោះសរុប</div>
          <div style="font-size: 26px; font-weight: 800; color: #fff;">${toKhmerNum(students.length)} នាក់</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 18px;">
          <div style="font-size: 12.5px; color: #fbbf24; margin-bottom: 4px;">រង់ចាំការបញ្ជាក់ (Pending)</div>
          <div style="font-size: 26px; font-weight: 800; color: #fbbf24;">
            ${toKhmerNum(students.filter(s => s.status === 'pending').length)} នាក់
          </div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-md); padding: 18px;">
          <div style="font-size: 12.5px; color: #60a5fa; margin-bottom: 4px;">កំពុងសិក្សា (Enrolled)</div>
          <div style="font-size: 26px; font-weight: 800; color: #60a5fa;">
            ${toKhmerNum(students.filter(s => s.status === 'enrolled').length)} នាក់
          </div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 18px;">
          <div style="font-size: 12.5px; color: #34d399; margin-bottom: 4px;">បានបញ្ចប់វគ្គ (Graduated)</div>
          <div style="font-size: 26px; font-weight: 800; color: #34d399;">
            ${toKhmerNum(students.filter(s => s.status === 'graduated').length)} នាក់
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="search-input-wrap">
          <span class="search-icon-inside">🔍</span>
          <input type="text" id="adminStudentSearch" class="form-control" placeholder="ស្វែងរកតាមឈ្មោះខ្មែរ/ឡាតាំង, លេខកូដ, ឬទូរស័ព្ទ..." />
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <select id="filterStudentCourse" class="form-control" style="width: auto;">
            <option value="all">គ្រប់វគ្គសិក្សាទាំងអស់</option>
            ${courses.map(c => `<option value="${c.id}">${c.code} - ${c.titleKh}</option>`).join('')}
          </select>

          <select id="filterStudentStatus" class="form-control" style="width: auto;">
            <option value="all">គ្រប់ស្ថានភាពទាំងអស់</option>
            <option value="pending">រង់ចាំការបញ្ជាក់ (Pending)</option>
            <option value="enrolled">កំពុងសិក្សា (Enrolled)</option>
            <option value="graduated">បានបញ្ចប់វគ្គ (Graduated)</option>
          </select>
        </div>
      </div>

      <!-- Students Table -->
      <div class="table-responsive">
        <table class="data-table" id="adminStudentsTable">
          <thead>
            <tr>
              <th>អត្តលេខសិស្ស</th>
              <th>ឈ្មោះសិស្ស</th>
              <th>ភេទ</th>
              <th>ទំនាក់ទំនង</th>
              <th>វគ្គសិក្សា & វេន</th>
              <th>ស្ថានភាពសិក្សា</th>
              <th>លទ្ធផលពិន្ទុ</th>
              <th style="text-align: right;">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody id="adminStudentsTableBody">
            ${students.map(s => {
              const course = store.getCourseById(s.courseId);
              return `
                <tr data-student-id="${s.id}">
                  <td style="font-family: var(--font-latin); font-weight: 700; color: var(--gold-300);">
                    ${s.id}
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${s.photoUrl}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid var(--gold-400);" alt="Avatar" />
                      <div>
                        <div style="font-weight: 700; color: #fff;">${s.nameKh}</div>
                        <div style="font-size: 11.5px; color: var(--text-dim); font-family: var(--font-latin); font-weight: 600;">${s.nameEn}</div>
                      </div>
                    </div>
                  </td>
                  <td>${s.gender}</td>
                  <td>
                    <div style="font-size: 13px;">${s.phone}</div>
                    <div style="font-size: 11px; color: var(--text-dim);">${s.email || '-'}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #e2e8f0; font-size: 13px;">${course ? course.titleKh : 'មិនស្គាល់វគ្គ'}</div>
                    <div style="font-size: 11.5px; color: var(--text-muted);">${s.shift}</div>
                  </td>
                  <td>
                    <select class="form-control change-student-status-select" data-id="${s.id}" style="padding: 4px 8px; font-size: 12px; width: auto; height: auto;">
                      <option value="pending" ${s.status === 'pending' ? 'selected' : ''}>⏳ Pending (រង់ចាំ)</option>
                      <option value="enrolled" ${s.status === 'enrolled' ? 'selected' : ''}>📘 Enrolled (កំពុងរៀន)</option>
                      <option value="graduated" ${s.status === 'graduated' ? 'selected' : ''}>🎓 Graduated (បញ្ចប់)</option>
                    </select>
                  </td>
                  <td>
                    ${s.grades ? `
                      <div>
                        <span class="badge ${s.grades.passed ? 'badge-success' : 'badge-danger'}">
                          ${s.grades.gradeLetter} (${toKhmerNum(s.grades.totalScore)} ពិន្ទុ)
                        </span>
                      </div>
                    ` : `
                      <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-dim);">មិនទាន់ដាក់ពិន្ទុ</span>
                    `}
                  </td>
                  <td style="text-align: right;">
                    <div class="table-action-btns" style="justify-content: flex-end;">
                      <button class="btn btn-outline btn-sm open-grade-direct-btn" data-id="${s.id}" title="ដាក់ពិន្ទុ">
                        <span>📝 ពិន្ទុ</span>
                      </button>
                      ${s.grades && s.grades.passed ? `
                        <button class="btn btn-gold btn-sm view-student-cert-btn" data-id="${s.id}" title="មើលវិញ្ញាបនបត្រ">
                          <span>🏆 សញ្ញាបត្រ</span>
                        </button>
                      ` : ''}
                      <button class="btn btn-danger btn-sm delete-student-btn" data-id="${s.id}" title="លុប">
                        <span>🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Add Student Direct Modal -->
      <div class="modal-backdrop" id="addStudentModal">
        <div class="modal-content" style="max-width: 640px;">
          <div class="modal-header">
            <h3 class="modal-title">
              <span>➕ បញ្ចូលសិស្សដោយផ្ទាល់ (Admin)</span>
            </h3>
            <button class="modal-close-btn" id="closeAddStudentModalBtn">✕</button>
          </div>

          <form id="adminDirectAddStudentForm">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">ឈ្មោះជាភាសាខ្មែរ <span class="req">*</span></label>
                <input type="text" id="admNameKh" class="form-control" placeholder="ឧ. កែវ សម្បត្តិ" required />
              </div>
              <div class="form-group">
                <label class="form-label">ឈ្មោះជាឡាតាំង <span class="req">*</span></label>
                <input type="text" id="admNameEn" class="form-control" placeholder="ឧ. KEO SAMBATH" style="text-transform: uppercase;" required />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">ភេទ</label>
                <select id="admGender" class="form-control">
                  <option value="ប្រុស">ប្រុស</option>
                  <option value="ស្រី">ស្រី</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">លេខទូរស័ព្ទ <span class="req">*</span></label>
                <input type="tel" id="admPhone" class="form-control" placeholder="012 345 678" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">វគ្គសិក្សា <span class="req">*</span></label>
              <select id="admCourseId" class="form-control" required>
                ${courses.map(c => `<option value="${c.id}">${c.code} - ${c.titleKh}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">វេនសិក្សា</label>
              <select id="admShift" class="form-control">
                <option value="វេនព្រឹក (៨:០០ - ៩:៣០ ព្រឹក)">វេនព្រឹក (៨:០០ - ៩:៣០ ព្រឹក)</option>
                <option value="វេនរសៀល (២:០០ - ៣:៣០ រសៀល)">វេនរសៀល (២:០០ - ៣:៣០ រសៀល)</option>
                <option value="វេនយប់ (៦:០០ - ៧:៣០ យប់)">វេនយប់ (៦:០០ - ៧:៣០ យប់)</option>
                <option value="វេនចុងសប្តាហ៍ (សៅរ៍ - អាទិត្យ)">វេនចុងសប្តាហ៍ (សៅរ៍ - អាទិត្យ)</option>
              </select>
            </div>

            <div class="form-group" style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px dashed var(--border-subtle);">
              <label class="form-label">📷 ជ្រើសរើសរូបថតសិស្ស (Student Photo)</label>
              <div style="display: flex; align-items: center; gap: 14px;">
                <img id="admPhotoPreview" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" style="width: 50px; height: 65px; border-radius: 4px; object-fit: cover; border: 1.5px solid var(--gold-400); flex-shrink: 0;" alt="Preview" />
                <input type="file" id="admPhotoInput" class="form-control" accept="image/*" style="font-size: 13px;" />
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-outline" id="cancelAddStudentBtn">បោះបង់</button>
              <button type="submit" class="btn btn-gold">រក្សាទុក</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function initAdminStudentsEvents(onNavigate, showToast) {
  // Navigation Tabs
  document.getElementById('tabCourses2')?.addEventListener('click', () => onNavigate('admin-courses'));
  document.getElementById('tabGrading2')?.addEventListener('click', () => onNavigate('admin-grading'));
  document.getElementById('tabCertificates2')?.addEventListener('click', () => onNavigate('certificate'));

  // Clear all fake students button
  document.getElementById('clearAllFakeStudentsBtn')?.addEventListener('click', () => {
    if (confirm('តើលោកគ្រូពិតជាចង់សម្អាតទិន្នន័យសិស្ស Fake ចោលទាំងអស់មែនទេ? សកម្មភាពនេះនឹងលុបទិន្នន័យតេស្តទាំងអស់ចេញ។')) {
      store.clearAllStudents();
      showToast('បានសម្អាតទិន្នន័យសិស្ស Fake ចោលជោគជ័យ!', 'success');
      onNavigate('admin-students');
    }
  });

  // Status Change Select Handler
  document.querySelectorAll('.change-student-status-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const studentId = e.currentTarget.getAttribute('data-id');
      const newStatus = e.currentTarget.value;
      store.updateStudent(studentId, { status: newStatus });
      showToast(`បានប្ដូរស្ថានភាពសិស្សទៅជា "${newStatus.toUpperCase()}"`, 'success');
    });
  });

  // Direct Grade Button
  document.querySelectorAll('.open-grade-direct-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.currentTarget.getAttribute('data-id');
      onNavigate('admin-grading', { targetStudentId: studentId });
    });
  });

  // View Certificate Button
  document.querySelectorAll('.view-student-cert-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.currentTarget.getAttribute('data-id');
      onNavigate('certificate', { studentId });
    });
  });

  // Delete Student
  document.querySelectorAll('.delete-student-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const studentId = e.currentTarget.getAttribute('data-id');
      const student = store.getStudentById(studentId);
      if (!student) return;

      if (confirm(`តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្ស "${student.nameKh}" នេះមែនទេ?`)) {
        store.deleteStudent(studentId);
        showToast('បានលុបទិន្នន័យសិស្សជោគជ័យ!', 'warning');
        onNavigate('admin-students');
      }
    });
  });

  // Add Student Direct Modal
  const modal = document.getElementById('addStudentModal');
  let admUploadedPhotoData = null;
  const admPhotoInput = document.getElementById('admPhotoInput');
  const admPhotoPreview = document.getElementById('admPhotoPreview');

  admPhotoInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      admUploadedPhotoData = event.target?.result;
      if (admPhotoPreview && admUploadedPhotoData) {
        admPhotoPreview.src = admUploadedPhotoData;
      }
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('openAddStudentModalBtn')?.addEventListener('click', () => {
    admUploadedPhotoData = null;
    modal?.classList.add('open');
  });
  document.getElementById('closeAddStudentModalBtn')?.addEventListener('click', () => modal?.classList.remove('open'));
  document.getElementById('cancelAddStudentBtn')?.addEventListener('click', () => modal?.classList.remove('open'));

  document.getElementById('adminDirectAddStudentForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameKh = document.getElementById('admNameKh').value;
    const nameEn = document.getElementById('admNameEn').value;
    const gender = document.getElementById('admGender').value;
    const phone = document.getElementById('admPhone').value;
    const courseId = document.getElementById('admCourseId').value;
    const shift = document.getElementById('admShift').value;

    store.registerStudent({
      nameKh,
      nameEn,
      gender,
      phone,
      courseId,
      shift,
      photoUrl: admUploadedPhotoData || undefined
    });

    showToast('បានបញ្ចូលសិស្សថ្មីដោយជោគជ័យ!', 'success');
    modal?.classList.remove('open');
    onNavigate('admin-students');
  });

  // Live Search & Course Filter
  const searchInput = document.getElementById('adminStudentSearch');
  const courseFilter = document.getElementById('filterStudentCourse');
  const statusFilter = document.getElementById('filterStudentStatus');

  function filterStudentsTable() {
    const q = searchInput?.value.toLowerCase() || '';
    const courseVal = courseFilter?.value || 'all';
    const statusVal = statusFilter?.value || 'all';
    const rows = document.querySelectorAll('#adminStudentsTableBody tr');

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const studentId = row.getAttribute('data-student-id');
      const student = store.getStudentById(studentId);

      const matchesSearch = text.includes(q);
      const matchesCourse = courseVal === 'all' || (student && student.courseId === courseVal);
      const matchesStatus = statusVal === 'all' || (student && student.status === statusVal);

      if (matchesSearch && matchesCourse && matchesStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  searchInput?.addEventListener('input', filterStudentsTable);
  courseFilter?.addEventListener('change', filterStudentsTable);
  statusFilter?.addEventListener('change', filterStudentsTable);
}
