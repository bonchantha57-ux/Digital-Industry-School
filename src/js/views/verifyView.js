import { store } from '../store.js';
import { toKhmerNum, formatKhmerDate } from '../utils/khmerNumbers.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { downloadCertificateAsImage, printCertificate } from '../utils/exportHelper.js';

/**
 * Public Verification Portal View
 * Enables live mobile phone QR scanning & instant Firestore cloud certificate verification
 */
export function renderVerifyView(params = {}) {
  let queryCertNo = params.certNo || '';
  let queryStudentId = params.studentId || '';

  if (!queryCertNo && !queryStudentId && typeof window !== 'undefined') {
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const sp = new URLSearchParams(hash.slice(qIndex + 1));
      queryStudentId = sp.get('studentId') || '';
      queryCertNo = sp.get('certNo') || '';
    } else if (window.location.search) {
      const sp = new URLSearchParams(window.location.search);
      queryStudentId = sp.get('studentId') || '';
      queryCertNo = sp.get('certNo') || '';
    }
  }

  // Attempt to find student in local cache first
  let matchedStudent = null;
  const allStudents = store.getStudents();

  if (queryStudentId) {
    matchedStudent = allStudents.find(s => s.id === queryStudentId);
  } else if (queryCertNo) {
    matchedStudent = allStudents.find(s => s.certificate?.certificateNo === queryCertNo);
  }

  const course = matchedStudent ? store.getCourseById(matchedStudent.courseId) : null;
  const settings = store.getSettings();

  // If search query is provided via URL (e.g. from QR scan) but not yet in local cache:
  const isPendingCloudFetch = (queryStudentId || queryCertNo) && !matchedStudent;

  return `
    <div class="container" style="padding: 40px 20px 80px; max-width: 960px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div class="badge badge-gold" style="margin-bottom: 12px; font-size: 13px; padding: 6px 16px;">
          🛡️ Digital Industry • Public Verification Portal
        </div>
        <h1 style="font-size: 32px; margin-bottom: 10px; font-family: var(--font-moul);">
          ប្រព័ន្ធផ្ទៀងផ្ទាត់សុពលភាពវិញ្ញាបនបត្រ
        </h1>
        <p style="color: var(--text-muted); font-size: 15px; max-width: 600px; margin: 0 auto;">
          ស្កេនពិនិត្យតាមរយៈ QR Code ឬបញ្ចូលលេខកូដវិញ្ញាបនបត្រ ដើម្បីផ្ទៀងផ្ទាត់ភាពត្រឹមត្រូវផ្ទាល់ពី Cloud Database។
        </p>
      </div>

      <!-- Search Input Box -->
      <div class="no-print" style="background: var(--bg-card); border: 1px solid var(--bg-glass-border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 30px; box-shadow: var(--shadow-md);">
        <form id="verifySearchForm" style="display: flex; gap: 12px; flex-wrap: wrap;">
          <div style="flex-grow: 1; min-width: 280px; position: relative;">
            <input 
              type="text" 
              id="verifySearchInput" 
              class="form-control" 
              placeholder="វាយបញ្ចូលលេខកូដវិញ្ញាបនបត្រ (ឧ. CERT-DI-2026-9279) ឬអត្តលេខសិស្ស (DI-2026-001)..." 
              value="${queryCertNo || queryStudentId || ''}"
              style="padding-left: 18px; font-size: 15px; height: 46px;"
              required
            />
          </div>
          <button type="submit" class="btn btn-gold" id="verifySubmitBtn" style="padding: 12px 28px; height: 46px;">
            <span>🔍 ពិនិត្យផ្ទៀងផ្ទាត់</span>
          </button>
        </form>
      </div>

      <!-- Verification Result Container -->
      <div id="verifyResultContainer">
        ${isPendingCloudFetch ? `
          <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98)); border: 2px solid var(--gold-400); border-radius: var(--radius-xl); padding: 50px 24px; text-align: center; box-shadow: 0 10px 30px rgba(217, 119, 6, 0.2);">
            <div style="font-size: 46px; margin-bottom: 16px; animation: bounce 1.5s infinite;">🔄</div>
            <h2 style="color: var(--gold-300); font-size: 22px; margin-bottom: 8px;">
              កំពុងផ្ទៀងផ្ទាត់វិញ្ញាបនបត្រពី Cloud Firestore...
            </h2>
            <p style="color: var(--text-muted); font-size: 14.5px;">
              កំពុងទាញទិន្នន័យសម្រាប់លេខកូដ៖ <strong style="color: #fff; font-family: var(--font-latin);">${queryCertNo || queryStudentId}</strong>
            </p>
          </div>
        ` : matchedStudent && matchedStudent.grades && matchedStudent.grades.passed ? renderVerifiedStudentMarkup(matchedStudent, course, settings) : `
          <div style="background: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 48px 24px; text-align: center;">
            <div style="font-size: 46px; margin-bottom: 12px;">🔎</div>
            <h3 style="color: #fff; font-size: 19px; margin-bottom: 8px;">
              សូមវាយបញ្ចូលលេខកូដវិញ្ញាបនបត្រ ឬលេខសម្គាល់សិស្ស
            </h3>
            <p style="color: var(--text-dim); font-size: 14px; max-width: 480px; margin: 0 auto;">
              ឧទាហរណ៍៖ <strong>CERT-DI-2026-9279</strong> ឬ អត្តលេខ <strong>DI-2026-001</strong>
            </p>
          </div>
        `}
      </div>
    </div>
  `;
}

/**
 * Render the full, official verification card and embedded certificate preview
 */
function renderVerifiedStudentMarkup(student, course, settings) {
  const certLocation = student.certificate?.issueLocation || 'រាជធានីភ្នំពេញ';
  const certDateIso = student.certificate?.issueDate || new Date().toISOString().split('T')[0];
  const certDateKh = formatKhmerDate(certDateIso, certLocation);
  const certTheme = student.certificate?.theme || 'gold';
  const certNo = student.certificate?.certificateNo || `CERT-${student.id}`;

  return `
    <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.98)); border: 2px solid rgba(16, 185, 129, 0.5); border-radius: var(--radius-xl); padding: 32px 24px; box-shadow: 0 15px 35px rgba(16, 185, 129, 0.18);">
      
      <!-- Verified Top Status Banner -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 20px; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; border: 2.5px solid #10b981; box-shadow: 0 0 18px rgba(16, 185, 129, 0.4); flex-shrink: 0; background: #070d19;">
            <img src="/assets/digital-industry-logo-round.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Digital Industry" />
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">✅</span>
              <span style="color: #34d399; font-weight: 700; font-size: 17px;">វិញ្ញាបនបត្រមានសុពលភាពផ្លូវការ ១០០%</span>
            </div>
            <div style="color: var(--text-dim); font-size: 13px; font-family: var(--font-latin); margin-top: 2px;">
              OFFICIALLY VERIFIED • DIGITAL INDUSTRY TRAINING CENTER
            </div>
          </div>
        </div>

        <div class="no-print" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-outline-gold btn-sm" id="verifyDownloadBtn">
            <span>📥 ទាញយកវិញ្ញាបនបត្រ (PNG)</span>
          </button>
          <button class="btn btn-gold btn-sm" id="verifyPrintBtn">
            <span>🖨️ បោះពុម្ព</span>
          </button>
        </div>
      </div>

      <!-- Student Profile Card -->
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px; background: rgba(255, 255, 255, 0.03); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); flex-wrap: wrap;">
        <img src="${student.photoUrl || '/assets/digital-industry-logo-round.png'}" 
             style="width: 75px; height: 75px; border-radius: 50%; object-fit: cover; border: 2.5px solid var(--gold-400); box-shadow: 0 4px 12px rgba(0,0,0,0.3);" 
             alt="Student Photo" />
        <div style="flex-grow: 1;">
          <h2 style="font-size: 24px; color: #fff; margin-bottom: 3px; font-family: var(--font-khmer); font-weight: 700;">
            ${student.nameKh}
          </h2>
          <div style="font-family: var(--font-latin); font-size: 16px; color: var(--gold-300); font-weight: 700;">
            ${student.nameEn}
          </div>
          <div style="font-size: 13.5px; color: var(--text-muted); margin-top: 5px;">
            អត្តលេខសិស្ស៖ <strong style="font-family: var(--font-latin); color: #fff;">${student.id}</strong> | 
            ភេទ៖ <strong style="color: #fff;">${student.gender}</strong>
          </div>
        </div>
      </div>

      <!-- Detailed Verification Specs Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 28px;">
        <div style="background: rgba(15, 23, 42, 0.7); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 2px;">មុខវិជ្ជា/វគ្គសិក្សា (Course)</div>
          <div style="font-weight: 700; color: #fff; font-size: 15px;">${course ? course.titleKh : 'វគ្គសិក្សាជំនាញខ្លី'}</div>
          <div style="font-size: 12px; color: var(--gold-300); font-family: var(--font-latin);">${course ? course.titleEn : 'Professional Course'}</div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 2px;">និទ្ទេស & លទ្ធផលប្រឡង (Result)</div>
          <div style="font-weight: 700; color: #34d399; font-size: 16px;">${student.grades.gradeKh}</div>
          <div style="font-size: 12px; color: var(--text-muted);">ពិន្ទុសរុប៖ <strong>${toKhmerNum(student.grades.totalScore)} / ១០០</strong> (ជាប់)</div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 2px;">លេខវិញ្ញាបនបត្រ (Ref No.)</div>
          <div style="font-weight: 700; color: var(--gold-300); font-family: var(--font-latin); font-size: 15px;">
            ${certNo}
          </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 2px;">ទីកន្លែង & កាលបរិច្ឆេទចេញ</div>
          <div style="font-weight: 600; color: #fff; font-size: 14px;">
            ${certDateKh}
          </div>
        </div>
      </div>

      <!-- EMBEDDED ORIGINAL LUXURY CERTIFICATE PREVIEW -->
      <div style="margin-top: 32px; border-top: 1px solid var(--border-subtle); padding-top: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="color: var(--gold-300); font-size: 18px; margin-bottom: 2px;">
              📜 ផ្ទាំងវិញ្ញាបនបត្រផ្លូវការ (Official Certificate View)
            </h3>
            <p style="color: var(--text-dim); font-size: 13px;">
              ផ្ទាំងវិញ្ញាបនបត្របញ្ជាក់ការសិក្សាស្ដង់ដារដែលបានចេញដោយប្រព័ន្ធ
            </p>
          </div>
        </div>

        <!-- Scrollable Certificate Canvas Container (Mobile Friendly) -->
        <div style="width: 100%; overflow-x: auto; padding-bottom: 15px; -webkit-overflow-scrolling: touch;">
          <div style="min-width: 900px; margin: 0 auto;">
            <div class="khmer-certificate theme-${certTheme}" id="verifiedKhmerCertificate" style="box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <div class="cert-frame-outer"></div>
              <div class="cert-frame-inner"></div>

              <img src="/assets/khmer-corner.svg" class="cert-corner-kbach tl" alt="Corner" />
              <img src="/assets/khmer-corner.svg" class="cert-corner-kbach tr" alt="Corner" />
              <img src="/assets/khmer-corner.svg" class="cert-corner-kbach bl" alt="Corner" />
              <img src="/assets/khmer-corner.svg" class="cert-corner-kbach br" alt="Corner" />

              <img src="/assets/digital-industry-logo-round.png" class="cert-watermark" style="border-radius: 50%; opacity: 0.08; width: 350px; height: 350px; object-fit: cover;" alt="Watermark" />

              <div class="cert-inner-content">
                <div class="cert-top-header">
                  <div class="cert-country-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
                  <div class="cert-motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                  <img src="/assets/cambodia-divider.svg" class="cert-divider-img" alt="Divider" />
                  <div class="cert-institute-kh">${settings.instituteNameKh || 'មជ្ឈមណ្ឌលបណ្តុះបណ្តាល Digital Industry'}</div>
                  <div class="cert-institute-en">${settings.instituteNameEn || 'DIGITAL INDUSTRY TRAINING CENTER'}</div>
                </div>

                <div class="cert-title-area">
                  <div class="cert-main-title-kh">វិញ្ញាបនបត្របញ្ជាក់ការសិក្សា</div>
                  <div class="cert-main-title-en">CERTIFICATE OF COMPLETION</div>
                </div>

                <div class="cert-body-centered">
                  <div class="cert-present-text">
                    វិញ្ញាបនបត្រនេះត្រូវបានប្រគល់ជូនដល់ / THIS CERTIFICATE IS PROUDLY PRESENTED TO
                  </div>
                  <div class="cert-recipient-box">
                    <div class="cert-recipient-kh">${student.nameKh}</div>
                    <div class="cert-recipient-en">${student.nameEn}</div>
                  </div>

                  <div class="cert-statement-box">
                    <div class="cert-statement">
                      បានបញ្ចប់ដោយជោគជ័យនូវវគ្គបណ្តុះបណ្តាលជំនាញខ្លីកម្រិតវិជ្ជាជីវៈលើមុខវិជ្ជា៖
                    </div>
                    <div class="cert-course-name">
                      ${course ? course.titleKh : 'វគ្គសិក្សាជំនាញវិជ្ជាជីវៈ'}
                      <span style="font-size: 15px; font-weight: normal; font-family: var(--font-latin); display: block; margin-top: 2px;">
                        (${course ? course.titleEn : 'Professional Certification'})
                      </span>
                    </div>
                    <div class="cert-statement" style="font-size: 13.5px; margin-top: 4px;">
                      រយៈពេលសិក្សាសរុប៖ <strong>${toKhmerNum(course ? course.hours : 30)} ម៉ោង</strong> | 
                      ទទួលបាន <strong>${student.grades.gradeKh}</strong> (ពិន្ទុ ${toKhmerNum(student.grades.totalScore)}/១០០)
                    </div>
                  </div>
                </div>

                <div class="cert-bottom-grid">
                  <div class="cert-sign-block">
                    <div class="cert-sign-date">${certDateKh}</div>
                    <div class="cert-sign-title">គ្រូបណ្តុះបណ្តាល (Training Instructor)</div>
                    <img src="/assets/born-chantha-signature.png" class="cert-signature-img" alt="Signature" />
                    <div class="cert-sign-name">លោក ប៊ន ចន្ថា (BORN CHANTHA)</div>
                  </div>

                  <div class="cert-student-photo-col">
                    <div class="cert-student-photo-frame size-md">
                      <div class="cert-photo-inner">
                        <img src="${student.photoUrl || '/assets/digital-industry-logo-round.png'}" 
                             style="transform: translate(${student.photoConfig?.x || 0}px, ${student.photoConfig?.y || 0}px) scale(${student.photoConfig?.zoom || 1.0});" 
                             class="cert-student-photo-img" alt="Student" />
                        <div class="cert-photo-id-tag">${student.id}</div>
                      </div>
                    </div>
                  </div>

                  <div class="cert-qr-block">
                    <img id="verifiedLiveQrImg" class="cert-qr-img" src="" alt="QR Code" />
                    <div class="cert-no-label">លេខវិញ្ញាបនបត្រ (Ref No.)</div>
                    <div class="cert-no-val">${certNo}</div>
                    <div style="font-size: 9.5px; color: #64748B; margin-top: 2px; font-family: var(--font-latin);">
                      OFFICIALLY VERIFIED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Issuer & Institution Footer -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 20px; border-top: 1px solid var(--border-subtle); font-size: 13.5px; color: var(--text-muted); flex-wrap: wrap; gap: 12px; margin-top: 20px;">
        <div>ស្ថាប័នបណ្តុះបណ្តាល៖ <strong>${settings.instituteNameKh || 'មជ្ឈមណ្ឌលបណ្តុះបណ្តាល Digital Industry'}</strong></div>
        <div>គ្រូ Training ទទួលបន្ទុក៖ <strong>${settings.directorName || 'លោក ប៊ន ចន្ថា'}</strong></div>
      </div>
    </div>
  `;
}

/**
 * Initialize event handlers and perform async cloud fetching for QR scans
 */
export function initVerifyEvents(onNavigate, showToast, params = {}) {
  const form = document.getElementById('verifySearchForm');
  const input = document.getElementById('verifySearchInput');
  const resultContainer = document.getElementById('verifyResultContainer');

  let queryStudentId = params.studentId || '';
  let queryCertNo = params.certNo || '';

  if (!queryStudentId && !queryCertNo && typeof window !== 'undefined') {
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const sp = new URLSearchParams(hash.slice(qIndex + 1));
      queryStudentId = sp.get('studentId') || '';
      queryCertNo = sp.get('certNo') || '';
    } else if (window.location.search) {
      const sp = new URLSearchParams(window.location.search);
      queryStudentId = sp.get('studentId') || '';
      queryCertNo = sp.get('certNo') || '';
    }
  }

  // Generate QR for the embedded certificate
  async function renderVerifyQR(student) {
    const qrImg = document.getElementById('verifiedLiveQrImg');
    if (!qrImg || !student) return;
    const certNo = student.certificate?.certificateNo || `CERT-${student.id}`;
    const hostBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'https://studentdinetwork.web.app'
      : window.location.origin;
    const verifyUrl = `${hostBase}/#verify?certNo=${encodeURIComponent(certNo)}&studentId=${encodeURIComponent(student.id)}`;
    const dataUrl = await generateQRCode(verifyUrl, { width: 150 });
    qrImg.src = dataUrl;
  }

  // Bind download and print buttons on verified certificate
  function bindVerifiedActionButtons(student) {
    document.getElementById('verifyDownloadBtn')?.addEventListener('click', async () => {
      showToast('កំពុងទាញយករូបភាពវិញ្ញាបនបត្រ...', 'info');
      const filename = `Certificate_${student.nameEn || student.id}.png`;
      const success = await downloadCertificateAsImage('verifiedKhmerCertificate', filename);
      if (success) {
        showToast('ទាញយករូបភាពវិញ្ញាបនបត្រជោគជ័យ!', 'success');
      }
    });

    document.getElementById('verifyPrintBtn')?.addEventListener('click', () => {
      printCertificate();
    });
  }

  // Async Verification Loader from Cloud Firestore
  async function performVerification(studentId, certNo) {
    let student = null;

    // 1. Check local store
    const allStudents = store.getStudents();
    if (studentId) {
      student = allStudents.find(s => s.id.toLowerCase() === studentId.toLowerCase());
    }
    if (!student && certNo) {
      student = allStudents.find(s => s.certificate?.certificateNo.toLowerCase() === certNo.toLowerCase());
    }

    // 2. If not found locally, fetch directly from Firestore Cloud Database
    if (!student) {
      if (resultContainer) {
        resultContainer.innerHTML = `
          <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98)); border: 2px solid var(--gold-400); border-radius: var(--radius-xl); padding: 48px 24px; text-align: center; box-shadow: 0 10px 30px rgba(217, 119, 6, 0.2);">
            <div style="font-size: 46px; margin-bottom: 16px; animation: bounce 1.5s infinite;">🔄</div>
            <h2 style="color: var(--gold-300); font-size: 22px; margin-bottom: 8px;">
              កំពុងផ្ទៀងផ្ទាត់វិញ្ញាបនបត្រពី Cloud Firestore...
            </h2>
            <p style="color: var(--text-muted); font-size: 14.5px;">
              កំពុងទាញទិន្នន័យសម្រាប់លេខកូដ៖ <strong style="color: #fff; font-family: var(--font-latin);">${certNo || studentId}</strong>
            </p>
          </div>
        `;
      }

      student = await store.fetchStudentFromFirestore(studentId, certNo);
    }

    if (student) {
      // Ensure course is fetched
      let course = store.getCourseById(student.courseId);
      if (!course && student.courseId) {
        course = await store.fetchCourseByIdFromFirestore(student.courseId);
      }

      const settings = store.getSettings();

      if (student.grades && student.grades.passed) {
        if (resultContainer) {
          resultContainer.innerHTML = renderVerifiedStudentMarkup(student, course, settings);
          renderVerifyQR(student);
          bindVerifiedActionButtons(student);
        }
        showToast(`ផ្ទៀងផ្ទាត់ជោគជ័យ! សិស្ស៖ ${student.nameKh}`, 'success');
      } else {
        if (resultContainer) {
          resultContainer.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-lg); padding: 40px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 12px;">⚠️</div>
              <h3 style="color: #f87171; font-size: 20px; margin-bottom: 6px;">
                រកឃើញសិស្ស (${student.nameKh}) ប៉ុន្តែពុំទាន់មានវិញ្ញាបនបត្រ ឬមិនទាន់បញ្ចប់ការសិក្សា!
              </h3>
            </div>
          `;
        }
        showToast('រកឃើញសិស្សនេះ ប៉ុន្តែពុំទាន់មានវិញ្ញាបនបត្រចេញជាផ្លូវការនៅឡើយទេ!', 'warning');
      }
    } else {
      if (resultContainer) {
        resultContainer.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-lg); padding: 40px; text-align: center;">
            <div style="font-size: 44px; margin-bottom: 12px;">❌</div>
            <h3 style="color: #f87171; font-size: 20px; margin-bottom: 8px;">
              ពុំមានទិន្នន័យវិញ្ញាបនបត្រដែលត្រូវនឹងលេខកូដនេះក្នុងប្រព័ន្ធទេ!
            </h3>
            <p style="color: var(--text-dim); font-size: 14px; max-width: 480px; margin: 0 auto;">
              សូមពិនិត្យមើលលេខកូដវិញ្ញាបនបត្រ ឬលេខសម្គាល់សិស្សម្តងទៀត ឬទាក់ទងមកកាន់គ្រូបណ្តុះបណ្តាលដើម្បីផ្ទៀងផ្ទាត់បន្ថែម។
            </p>
          </div>
        `;
      }
      showToast('ពុំមានទិន្នន័យវិញ្ញាបនបត្រដែលត្រូវនឹងលេខកូដនេះក្នុងប្រព័ន្ធទេ!', 'error');
    }
  }

  // If page loaded with URL search parameters, run verification immediately
  if (queryStudentId || queryCertNo) {
    const existing = store.getStudentById(queryStudentId);
    if (existing && existing.grades && existing.grades.passed) {
      renderVerifyQR(existing);
      bindVerifiedActionButtons(existing);
    } else {
      performVerification(queryStudentId, queryCertNo);
    }
  }

  // Handle manual search form submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input?.value.trim() || '';
    if (!query) return;

    // Check if query is Student ID or Cert No
    if (query.toUpperCase().startsWith('CERT-')) {
      await performVerification(null, query);
    } else {
      await performVerification(query, query);
    }
  });
}
