import { store } from '../store.js';
import { toKhmerNum, formatKhmerDate } from '../utils/khmerNumbers.js';

export function renderVerifyView(params = {}) {
  const queryCertNo = params.certNo || '';
  const queryStudentId = params.studentId || '';

  // Attempt to find student if query provided
  let matchedStudent = null;
  const allStudents = store.getStudents();

  if (queryStudentId) {
    matchedStudent = allStudents.find(s => s.id === queryStudentId);
  } else if (queryCertNo) {
    matchedStudent = allStudents.find(s => s.certificate?.certificateNo === queryCertNo);
  }

  const course = matchedStudent ? store.getCourseById(matchedStudent.courseId) : null;
  const settings = store.getSettings();

  return `
    <div class="container" style="padding: 40px 24px 80px; max-width: 820px;">
      <div style="text-align: center; margin-bottom: 36px;">
        <div class="badge badge-gold" style="margin-bottom: 12px;">🛡️ Public Verification Portal</div>
        <h1 style="font-size: 32px; margin-bottom: 10px;">
          ប្រព័ន្ធផ្ទៀងផ្ទាត់សុពលភាពវិញ្ញាបនបត្រ
        </h1>
        <p style="color: var(--text-muted); font-size: 15px;">
          បញ្ចូលលេខកូដវិញ្ញាបនបត្រ ឬលេខសម្គាល់សិស្សដើម្បីពិនិត្យភាពត្រឹមត្រូវ និងព័ត៌មានលម្អិតពីប្រព័ន្ធផ្លូវការ។
        </p>
      </div>

      <!-- Search Input Box -->
      <div style="background: var(--bg-card); border: 1px solid var(--bg-glass-border); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 32px; box-shadow: var(--shadow-md);">
        <form id="verifySearchForm" style="display: flex; gap: 12px; flex-wrap: wrap;">
          <div style="flex-grow: 1; min-width: 280px; position: relative;">
            <input 
              type="text" 
              id="verifySearchInput" 
              class="form-control" 
              placeholder="វាយបញ្ចូលលេខកូដវិញ្ញាបនបត្រ (ឧ. CERT-2026-8801) ឬអត្តលេខសិស្ស..." 
              value="${queryCertNo || queryStudentId || ''}"
              style="padding-left: 18px; font-size: 15.5px;"
              required
            />
          </div>
          <button type="submit" class="btn btn-gold" style="padding: 12px 28px;">
            <span>🔍 ពិនិត្យផ្ទៀងផ្ទាត់</span>
          </button>
        </form>
      </div>

      <!-- Verification Result Section -->
      <div id="verifyResultContainer">
        ${matchedStudent && matchedStudent.grades && matchedStudent.grades.passed ? `
          <div style="background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.98)); border: 2px solid rgba(16, 185, 129, 0.4); border-radius: var(--radius-xl); padding: 36px; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.15);">
            <!-- Verified Header Banner -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 20px; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 52px; height: 52px; border-radius: 50%; overflow: hidden; border: 2px solid #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.35); flex-shrink: 0; background: #070d19;">
                  <img src="/assets/digital-industry-logo-round.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Digital Industry" />
                </div>
                <div>
                  <div style="color: #34d399; font-weight: 700; font-size: 16px;">វិញ្ញាបនបត្រមានសុពលភាពផ្លូវការ (Digital Industry)</div>
                  <div style="color: var(--text-dim); font-size: 12.5px; font-family: var(--font-latin);">OFFICIALLY VERIFIED • TRAINER: BORN CHANTHA</div>
                </div>
              </div>

              <button class="btn btn-gold btn-sm" id="viewFullCertBtn" data-id="${matchedStudent.id}">
                <span>🏆 មើលផ្ទាំងវិញ្ញាបនបត្រដើម</span>
              </button>
            </div>

            <!-- Student Profile Grid -->
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 28px; background: rgba(255, 255, 255, 0.02); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <img src="${matchedStudent.photoUrl}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-400);" alt="Student" />
              <div>
                <h3 style="font-size: 22px; color: #fff; margin-bottom: 2px;">${matchedStudent.nameKh}</h3>
                <div style="font-family: var(--font-latin); font-size: 15px; color: var(--gold-300); font-weight: 700;">${matchedStudent.nameEn}</div>
                <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                  អត្តលេខសិស្ស៖ <span style="font-family: var(--font-latin); color: #fff;">${matchedStudent.id}</span> | 
                  ភេទ៖ ${matchedStudent.gender}
                </div>
              </div>
            </div>

            <!-- Detailed Specs Table -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px;">
              <div style="background: rgba(15, 23, 42, 0.6); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 2px;">មុខវិជ្ជា/វគ្គសិក្សា</div>
                <div style="font-weight: 700; color: #fff; font-size: 15px;">${course ? course.titleKh : ''}</div>
                <div style="font-size: 12px; color: var(--gold-300); font-family: var(--font-latin);">${course ? course.titleEn : ''}</div>
              </div>

              <div style="background: rgba(15, 23, 42, 0.6); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 2px;">និទ្ទេស & លទ្ធផលប្រឡង</div>
                <div style="font-weight: 700; color: #34d399; font-size: 15px;">${matchedStudent.grades.gradeKh}</div>
                <div style="font-size: 12px; color: var(--text-muted);">ពិន្ទុសរុប៖ ${toKhmerNum(matchedStudent.grades.totalScore)} / ១០០</div>
              </div>

              <div style="background: rgba(15, 23, 42, 0.6); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 2px;">លេខវិញ្ញាបនបត្រ (Ref No.)</div>
                <div style="font-weight: 700; color: var(--gold-300); font-family: var(--font-latin); font-size: 15px;">
                  ${matchedStudent.certificate?.certificateNo || 'CERT-2026-8801'}
                </div>
              </div>

              <div style="background: rgba(15, 23, 42, 0.6); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 2px;">កាលបរិច្ឆេទចេញវិញ្ញាបនបត្រ</div>
                <div style="font-weight: 600; color: #fff; font-size: 14px;">
                  ${formatKhmerDate(matchedStudent.certificate?.issueDate)}
                </div>
              </div>
            </div>

            <!-- Issuer & Trainer Info -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 18px; border-top: 1px solid var(--border-subtle); font-size: 13.5px; color: var(--text-muted); flex-wrap: wrap; gap: 12px;">
              <div>ស្ថាប័នបណ្តុះបណ្តាល៖ <strong>${settings.instituteNameKh}</strong></div>
              <div>គ្រូ Training ទទួលបន្ទុក៖ <strong>${settings.directorName}</strong></div>
            </div>
          </div>
        ` : `
          <div style="background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 40px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">🔎</div>
            <h3 style="color: var(--text-muted); font-size: 18px; margin-bottom: 6px;">
              សូមវាយបញ្ចូលលេខកូដវិញ្ញាបនបត្រ ឬលេខសម្គាល់សិស្ស
            </h3>
            <p style="color: var(--text-dim); font-size: 13.5px; max-width: 440px; margin: 0 auto;">
              ឧទាហរណ៍សាកល្បង៖ <strong>CERT-2026-8801</strong> ឬ <strong>STU-2026-001</strong> ឬ <strong>012 778 899</strong>
            </p>
          </div>
        `}
      </div>
    </div>
  `;
}

export function initVerifyEvents(onNavigate, showToast) {
  const form = document.getElementById('verifySearchForm');
  const input = document.getElementById('verifySearchInput');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input?.value.trim() || '';
    if (!query) return;

    const allStudents = store.getStudents();
    const qLower = query.toLowerCase();

    // Search by Certificate No, Student ID, or Phone
    const found = allStudents.find(s => 
      (s.certificate && s.certificate.certificateNo.toLowerCase() === qLower) ||
      s.id.toLowerCase() === qLower ||
      s.phone.replace(/\s+/g, '').includes(query.replace(/\s+/g, '')) ||
      s.nameKh.includes(query) ||
      s.nameEn.toLowerCase().includes(qLower)
    );

    if (found) {
      if (!found.grades || !found.grades.passed) {
        showToast('រកឃើញសិស្សនេះ ប៉ុន្តែពុំទាន់មានវិញ្ញាបនបត្រ ឬមិនទាន់បានបញ្ចប់ការសិក្សា!', 'warning');
      } else {
        showToast(`ផ្ទៀងផ្ទាត់ជោគជ័យ! សិស្ស៖ ${found.nameKh}`, 'success');
      }
      onNavigate('verify', { studentId: found.id, certNo: found.certificate?.certificateNo });
    } else {
      showToast('ពុំមានទិន្នន័យវិញ្ញាបនបត្រដែលត្រូវនឹងលេខកូដនេះក្នុងប្រព័ន្ធទេ!', 'error');
    }
  });

  document.getElementById('viewFullCertBtn')?.addEventListener('click', (e) => {
    const studentId = e.currentTarget.getAttribute('data-id');
    onNavigate('certificate', { studentId });
  });
}
