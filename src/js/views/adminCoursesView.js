import { store } from '../store.js';
import { toKhmerNum } from '../utils/khmerNumbers.js';

export function renderAdminCoursesView() {
  const allCourses = store.getCourses(true); // Admin sees all (published + drafts + closed)
  const students = store.getStudents();

  return `
    <div class="container" style="padding: 30px 24px 60px;">
      <!-- Admin Top Navigation Bar -->
      <div class="admin-header">
        <div>
          <div class="badge badge-gold" style="margin-bottom: 6px;">⚙️ Admin Control Panel</div>
          <h1 style="font-size: 26px;">គ្រប់គ្រងវគ្គសិក្សា (Course Management)</h1>
          <p style="color: var(--text-muted); font-size: 14px;">
            Admin ត្រូវបង្កើត និងបើក (Publish) វគ្គសិក្សាត្រង់នេះសិន ទើបវគ្គទាំងនោះបង្ហាញក្នុងទម្រង់ចុះឈ្មោះរបស់សិស្ស។
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-gold" id="openAddCourseModalBtn">
            <span>➕ បន្ថែមវគ្គសិក្សាថ្មី</span>
          </button>
        </div>
      </div>

      <!-- Admin Tab Bar -->
      <div style="margin-bottom: 24px;">
        <div class="admin-tabs">
          <button class="admin-tab-btn active" id="tabCourses">
            <span>📚 បញ្ជីវគ្គសិក្សា (${toKhmerNum(allCourses.length)})</span>
          </button>
          <button class="admin-tab-btn" id="tabStudents">
            <span>👥 បញ្ជីសិស្សចុះឈ្មោះ (${toKhmerNum(students.length)})</span>
          </button>
          <button class="admin-tab-btn" id="tabGrading">
            <span>📝 ដាក់ពិន្ទុ & វាយតម្លៃសិស្ស</span>
          </button>
          <button class="admin-tab-btn" id="tabCertificates">
            <span>🏆 វិញ្ញាបនបត្របែបខ្មែរ (Certificate)</span>
          </button>
        </div>
      </div>

      <!-- Stats Counters for Courses -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px;">
          <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 4px;">វគ្គសិក្សាសរុបទាំងអស់</div>
          <div style="font-size: 26px; font-weight: 800; color: #fff;">${toKhmerNum(allCourses.length)}</div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 18px;">
          <div style="font-size: 12.5px; color: #34d399; margin-bottom: 4px;">វគ្គកំពុងបើកទទួលសិស្ស (Published)</div>
          <div style="font-size: 26px; font-weight: 800; color: #34d399;">
            ${toKhmerNum(allCourses.filter(c => c.status === 'published').length)}
          </div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 18px;">
          <div style="font-size: 12.5px; color: #fbbf24; margin-bottom: 4px;">វគ្គព្រាងមិនទាន់បើក (Drafts)</div>
          <div style="font-size: 26px; font-weight: 800; color: #fbbf24;">
            ${toKhmerNum(allCourses.filter(c => c.status === 'draft').length)}
          </div>
        </div>
      </div>

      <!-- Filter / Search Controls -->
      <div class="filter-bar">
        <div class="search-input-wrap">
          <span class="search-icon-inside">🔍</span>
          <input type="text" id="adminCourseSearch" class="form-control" placeholder="ស្វែងរកតាមឈ្មោះវគ្គ, កូដ, ឬសាស្ត្រាចារ្យ..." />
        </div>

        <div style="display: flex; gap: 10px;">
          <select id="adminCourseStatusFilter" class="form-control" style="width: auto;">
            <option value="all">ស្ថានភាពទាំងអស់ (All Status)</option>
            <option value="published">កំពុងបើកទទួលសិស្ស (Published)</option>
            <option value="draft">ព្រាងទុក (Draft)</option>
            <option value="closed">បានបិទ (Closed)</option>
          </select>
        </div>
      </div>

      <!-- Courses Table -->
      <div class="table-responsive">
        <table class="data-table" id="adminCoursesTable">
          <thead>
            <tr>
              <th>កូដវគ្គ</th>
              <th>ឈ្មោះវគ្គសិក្សា</th>
              <th>សាស្ត្រាចារ្យ</th>
              <th>ម៉ោង</th>
              <th>តម្លៃសិក្សា</th>
              <th>សិស្សចុះឈ្មោះ</th>
              <th>ស្ថានភាព</th>
              <th style="text-align: right;">សកម្មភាព</th>
            </tr>
          <tbody id="adminCoursesTableBody">
            ${allCourses.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 60px 24px;">
                  <div style="font-size: 50px; margin-bottom: 14px;">📚</div>
                  <h3 style="font-size: 19px; color: var(--gold-300); margin-bottom: 8px;">
                    មិនទាន់មានវគ្គសិក្សានៅឡើយទេ (រង់ចាំ Admin បញ្ចូល)
                  </h3>
                  <p style="color: var(--text-muted); font-size: 14px; max-width: 520px; margin: 0 auto 20px; line-height: 1.6;">
                    វគ្គសិក្សាទាំងអស់ត្រូវបានកំណត់មិនឱ្យបង្ហាញមកដោយឯកឯងឡើយ។ សូមលោកគ្រូ Admin ចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើត និងបើក (Publish) វគ្គសិក្សាថ្មី។
                  </p>
                  <button class="btn btn-gold" id="emptyAddCourseBtn">
                    <span>➕ បញ្ចូលវគ្គសិក្សាថ្មីឥឡូវនេះ</span>
                  </button>
                </td>
              </tr>
            ` : allCourses.map(course => {
              const enrolledStudents = students.filter(s => s.courseId === course.id);
              return `
                <tr data-id="${course.id}">
                  <td style="font-family: var(--font-latin); font-weight: 700; color: var(--gold-300);">
                    ${course.code}
                  </td>
                  <td>
                    <div style="font-weight: 700; color: #fff;">${course.titleKh}</div>
                    <div style="font-size: 11.5px; color: var(--text-dim); font-family: var(--font-latin);">${course.titleEn}</div>
                    <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                      <span class="badge" style="background: rgba(255,255,255,0.05); font-size: 11px;">${course.category}</span>
                    </div>
                  </td>
                  <td>${course.instructor}</td>
                  <td>${toKhmerNum(course.hours)} ម៉ោង</td>
                  <td style="font-weight: 700; color: #34d399;">
                    ${course.fee === 0 ? 'ឥតគិតថ្លៃ' : `$${course.fee}`}
                  </td>
                  <td>
                    <span class="badge badge-primary">${toKhmerNum(enrolledStudents.length)} នាក់</span>
                  </td>
                  <td>
                    ${course.status === 'published' 
                      ? `<span class="badge badge-success">✓ Published (បើក)</span>`
                      : course.status === 'draft'
                      ? `<span class="badge badge-warning">⏳ Draft (ព្រាង)</span>`
                      : `<span class="badge badge-danger">✕ Closed (បិទ)</span>`
                    }
                  </td>
                  <td style="text-align: right;">
                    <div class="table-action-btns" style="justify-content: flex-end;">
                      <button class="btn btn-outline btn-sm toggle-course-status-btn" data-id="${course.id}" title="ប្ដូរស្ថានភាព បើក/បិទ">
                        <span>${course.status === 'published' ? '⏸️ បិទ' : '▶️ បើក'}</span>
                      </button>
                      <button class="btn btn-outline btn-sm edit-course-btn" data-id="${course.id}" title="កែប្រែ">
                        <span>✏️</span>
                      </button>
                      <button class="btn btn-danger btn-sm delete-course-btn" data-id="${course.id}" title="លុប">
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

      <!-- Add / Edit Course Modal Dialog -->
      <div class="modal-backdrop" id="courseFormModal">
        <div class="modal-content" style="max-width: 680px;">
          <div class="modal-header">
            <h3 class="modal-title" id="courseModalHeading">
              <span>➕ បន្ថែមវគ្គសិក្សាថ្មី</span>
            </h3>
            <button class="modal-close-btn" id="closeCourseModalBtn">✕</button>
          </div>

          <form id="saveCourseForm">
            <input type="hidden" id="courseFormId" value="" />

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="formCourseCode">
                  លេខកូដវគ្គ (Course Code) <span class="req">*</span>
                </label>
                <input type="text" id="formCourseCode" class="form-control" placeholder="ឧ. FSW-101" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="formCourseCategory">
                  ជំនាញ / ប្រភេទ (Category) <span class="req">*</span>
                </label>
                <select id="formCourseCategory" class="form-control" required>
                  <option value="បច្ចេកវិទ្យា & សរសេរកូដ">បច្ចេកវិទ្យា & សរសេរកូដ (Coding & Tech)</option>
                  <option value="រចនាក្រាហ្វិក & សិល្បៈ">រចនាក្រាហ្វិក & សិល្បៈ (Graphic & UI/UX)</option>
                  <option value="បណ្តាញ & សុវត្ថិភាព">បណ្តាញ & សុវត្ថិភាព (Network & Security)</option>
                  <option value="ទិន្នន័យ & AI">ទិន្នន័យ & AI (Data & AI)</option>
                  <option value="ហិរញ្ញវត្ថុ & អាជីវកម្ម">ហិរញ្ញវត្ថុ & អាជីវកម្ម (Accounting & Business)</option>
                  <option value="ភាសាបរទេស">ភាសាបរទេស (Languages)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="formCourseTitleKh">
                ឈ្មោះវគ្គសិក្សាជាភាសាខ្មែរ <span class="req">*</span>
              </label>
              <input type="text" id="formCourseTitleKh" class="form-control" placeholder="ឧ. វគ្គអភិវឌ្ឍន៍គេហទំព័រពេញលេញ" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="formCourseTitleEn">
                ឈ្មោះវគ្គជាភាសាអង់គ្លេស <span class="req">*</span>
                <span class="form-label-hint">(សម្រាប់ដាក់លើវិញ្ញាបនបត្រ)</span>
              </label>
              <input type="text" id="formCourseTitleEn" class="form-control" placeholder="ឧ. Full-Stack Web Development" required />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="formCourseInstructor">
                  គ្រូបង្រៀន / សាស្ត្រាចារ្យ <span class="req">*</span>
                </label>
                <input type="text" id="formCourseInstructor" class="form-control" placeholder="ឧ. លោកគ្រូ គង់ វិបុល" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="formCourseHours">
                  រយៈពេលសិក្សាសរុប (ម៉ោង) <span class="req">*</span>
                </label>
                <input type="number" id="formCourseHours" class="form-control" placeholder="ឧ. 72" min="1" required />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="formCourseFee">
                  តម្លៃសិក្សា (USD) <span class="req">*</span>
                  <span class="form-label-hint">(ដាក់ 0 បើសិនជាឥតគិតថ្លៃ)</span>
                </label>
                <input type="number" id="formCourseFee" class="form-control" placeholder="ឧ. 180" min="0" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="formCourseStatus">
                  ស្ថានភាពវគ្គសិក្សា (Publish Status) <span class="req">*</span>
                </label>
                <select id="formCourseStatus" class="form-control" required>
                  <option value="published">✓ Published (បើកអោយសិស្សចុះឈ្មោះភ្លាមៗ)</option>
                  <option value="draft">⏳ Draft (ព្រាងទុក មិនទាន់អោយសិស្សឃើញ)</option>
                  <option value="closed">✕ Closed (បិទការទទួលពាក្យ)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="formCourseSchedule">
                កាលវិភាគសិក្សា (Schedule)
              </label>
              <input type="text" id="formCourseSchedule" class="form-control" placeholder="ឧ. ចន្ទ - សុក្រ (ម៉ោង ៦:០០ - ៧:៣០ យប់)" />
            </div>

            <div class="form-group">
              <label class="form-label" for="formCourseDesc">
                សេចក្តីពិពណ៌នាអំពីវគ្គសិក្សា (Description)
              </label>
              <textarea id="formCourseDesc" class="form-control" placeholder="រៀបរាប់ពីមេរៀន និងអត្ថប្រយោជន៍ដែលសិស្សទទួលបាន..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-subtle);">
              <button type="button" class="btn btn-outline" id="cancelCourseModalBtn">បោះបង់</button>
              <button type="submit" class="btn btn-gold">
                <span id="saveCourseBtnText">រក្សាទុកវគ្គសិក្សា</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function initAdminCoursesEvents(onNavigate, showToast) {
  // Navigation Tabs
  document.getElementById('tabStudents')?.addEventListener('click', () => onNavigate('admin-students'));
  document.getElementById('tabGrading')?.addEventListener('click', () => onNavigate('admin-grading'));
  document.getElementById('tabCertificates')?.addEventListener('click', () => onNavigate('certificate', { studentId: 'STU-2026-001' }));

  const modal = document.getElementById('courseFormModal');
  const modalHeading = document.getElementById('courseModalHeading');
  const courseForm = document.getElementById('saveCourseForm');
  const formId = document.getElementById('courseFormId');

  // Open Add Modal
  const openModalHandler = () => {
    courseForm.reset();
    formId.value = '';
    modalHeading.innerHTML = '<span>➕ បន្ថែមវគ្គសិក្សាថ្មី</span>';
    modal?.classList.add('open');
  };

  document.getElementById('openAddCourseModalBtn')?.addEventListener('click', openModalHandler);
  document.getElementById('emptyAddCourseBtn')?.addEventListener('click', openModalHandler);

  // Close Modal
  document.getElementById('closeCourseModalBtn')?.addEventListener('click', () => modal?.classList.remove('open'));
  document.getElementById('cancelCourseModalBtn')?.addEventListener('click', () => modal?.classList.remove('open'));

  // Save Form (Add or Edit)
  courseForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const courseData = {
      code: document.getElementById('formCourseCode').value.trim(),
      category: document.getElementById('formCourseCategory').value,
      titleKh: document.getElementById('formCourseTitleKh').value.trim(),
      titleEn: document.getElementById('formCourseTitleEn').value.trim(),
      instructor: document.getElementById('formCourseInstructor').value.trim(),
      hours: document.getElementById('formCourseHours').value,
      fee: document.getElementById('formCourseFee').value,
      status: document.getElementById('formCourseStatus').value,
      schedule: document.getElementById('formCourseSchedule').value.trim(),
      description: document.getElementById('formCourseDesc').value.trim()
    };

    if (formId.value) {
      // Edit existing
      store.updateCourse(formId.value, courseData);
      showToast('បានកែប្រែព័ត៌មានវគ្គសិក្សាជោគជ័យ!', 'success');
    } else {
      // Create new
      store.addCourse(courseData);
      showToast('បានបន្ថែមវគ្គសិក្សាថ្មីដោយជោគជ័យ!', 'success');
    }

    modal?.classList.remove('open');
    onNavigate('admin-courses');
  });

  // Edit Course Button Handler
  document.querySelectorAll('.edit-course-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const courseId = e.currentTarget.getAttribute('data-id');
      const course = store.getCourseById(courseId);
      if (!course) return;

      formId.value = course.id;
      document.getElementById('formCourseCode').value = course.code;
      document.getElementById('formCourseCategory').value = course.category;
      document.getElementById('formCourseTitleKh').value = course.titleKh;
      document.getElementById('formCourseTitleEn').value = course.titleEn;
      document.getElementById('formCourseInstructor').value = course.instructor;
      document.getElementById('formCourseHours').value = course.hours;
      document.getElementById('formCourseFee').value = course.fee;
      document.getElementById('formCourseStatus').value = course.status;
      document.getElementById('formCourseSchedule').value = course.schedule || '';
      document.getElementById('formCourseDesc').value = course.description || '';

      modalHeading.innerHTML = `<span>✏️ កែប្រែវគ្គ៖ ${course.code}</span>`;
      modal?.classList.add('open');
    });
  });

  // Toggle Status Publish / Draft
  document.querySelectorAll('.toggle-course-status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const courseId = e.currentTarget.getAttribute('data-id');
      const course = store.getCourseById(courseId);
      if (!course) return;

      const newStatus = course.status === 'published' ? 'draft' : 'published';
      store.updateCourse(courseId, { status: newStatus });
      showToast(`បានប្ដូរស្ថានភាពវគ្គទៅជា "${newStatus.toUpperCase()}"!`, 'gold');
      onNavigate('admin-courses');
    });
  });

  // Delete Course
  document.querySelectorAll('.delete-course-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const courseId = e.currentTarget.getAttribute('data-id');
      const course = store.getCourseById(courseId);
      if (!course) return;

      if (confirm(`តើអ្នកពិតជាចង់លុបវគ្គ "${course.titleKh}" នេះមែនទេ?`)) {
        store.deleteCourse(courseId);
        showToast('បានលុបវគ្គសិក្សាដោយជោគជ័យ!', 'warning');
        onNavigate('admin-courses');
      }
    });
  });

  // Live Search
  const searchInput = document.getElementById('adminCourseSearch');
  const statusFilter = document.getElementById('adminCourseStatusFilter');

  function filterCoursesTable() {
    const q = searchInput?.value.toLowerCase() || '';
    const statusVal = statusFilter?.value || 'all';
    const rows = document.querySelectorAll('#adminCoursesTableBody tr');

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const courseId = row.getAttribute('data-id');
      const course = store.getCourseById(courseId);

      const matchesSearch = text.includes(q);
      const matchesStatus = statusVal === 'all' || (course && course.status === statusVal);

      if (matchesSearch && matchesStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  searchInput?.addEventListener('input', filterCoursesTable);
  statusFilter?.addEventListener('change', filterCoursesTable);
}
