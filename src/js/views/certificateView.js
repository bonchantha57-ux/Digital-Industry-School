import { store } from '../store.js';
import { toKhmerNum, formatKhmerDate } from '../utils/khmerNumbers.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { downloadCertificateAsImage, printCertificate } from '../utils/exportHelper.js';

export function renderCertificateView(params = {}) {
  const students = store.getStudents();
  // Filter students who have passed grades or are graduated
  const eligibleStudents = students.filter(s => s.grades && s.grades.passed);

  // Determine current student to display
  let currentStudent = null;
  if (params.studentId) {
    currentStudent = store.getStudentById(params.studentId);
  }
  if (!currentStudent && eligibleStudents.length > 0) {
    currentStudent = eligibleStudents[0];
  }

  // If no eligible student exists at all
  if (!currentStudent) {
    return `
      <div class="container" style="padding: 60px 24px; text-align: center;">
        <div class="form-card" style="max-width: 600px; margin: 0 auto; padding: 50px 30px;">
          <div style="font-size: 54px; margin-bottom: 16px;">🏆</div>
          <h2 style="font-size: 24px; color: var(--gold-300); margin-bottom: 12px;">
            មិនទាន់មានសិស្សដែលបានបញ្ចប់ ឬជាប់វគ្គសិក្សានៅឡើយទេ
          </h2>
          <p style="color: var(--text-muted); line-height: 1.7; margin-bottom: 24px;">
            ដើម្បីបង្កើតវិញ្ញាបនបត្រ Admin ឬគ្រូត្រូវតែចូលទៅផ្ទាំង "ដាក់ពិន្ទុ & វាយតម្លៃសិស្ស" ជាមុនសិន ហើយដាក់ពិន្ទុសិស្សអោយបានចាប់ពី ៥០ ពិន្ទុឡើងទៅ (និទ្ទេស A, B, C, D)។
          </p>
          <button class="btn btn-gold" id="noCertGoToGradeBtn">
            <span>📝 ទៅកាន់ផ្ទាំងដាក់ពិន្ទុ</span>
          </button>
        </div>
      </div>
    `;
  }

  // Ensure certificate object exists on student
  if (!currentStudent.certificate) {
    store.generateCertificate(currentStudent.id);
    currentStudent = store.getStudentById(currentStudent.id);
  }

  const course = store.getCourseById(currentStudent.courseId);
  const settings = store.getSettings();
  const certTheme = currentStudent.certificate?.theme || 'gold';
  const certLocation = currentStudent.certificate?.issueLocation || 'រាជធានីភ្នំពេញ';
  const certDateIso = currentStudent.certificate?.issueDate || new Date().toISOString().split('T')[0];
  const certDateKh = formatKhmerDate(certDateIso, certLocation);
  const photoMode = currentStudent.photoMode || currentStudent.certificate?.photoMode || 'digital';

  return `
    <div class="cert-page-wrapper">
      <div class="container">
        <!-- Toolbar -->
        <div class="cert-toolbar no-print">
          <div class="cert-toolbar-left">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 600; color: #fff; font-size: 14px;">ជ្រើសរើសសិស្ស៖</span>
              <select id="certStudentSelector" class="form-control" style="width: auto; min-width: 220px; padding: 7px 12px; font-size: 14px;">
                ${eligibleStudents.map(s => `
                  <option value="${s.id}" ${s.id === currentStudent.id ? 'selected' : ''}>
                    ${s.nameKh} (${s.nameEn}) - ${s.grades.gradeLetter}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Theme Switcher (5 Luxury Khmer Themes) -->
            <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px; flex-wrap: wrap;">
              <span style="font-size: 13px; color: var(--text-muted);">ម៉ូដសញ្ញាបត្រ៖</span>
              <button class="theme-btn ${certTheme === 'gold' ? 'active' : ''}" data-theme="gold">
                <span class="theme-dot gold"></span>
                <span>មាសបុរាណ</span>
              </button>
              <button class="theme-btn ${certTheme === 'navy' ? 'active' : ''}" data-theme="navy">
                <span class="theme-dot navy"></span>
                <span>ខៀវរាជវង្ស</span>
              </button>
              <button class="theme-btn ${certTheme === 'emerald' ? 'active' : ''}" data-theme="emerald">
                <span class="theme-dot emerald"></span>
                <span>ត្បូងមរកត</span>
              </button>
              <button class="theme-btn ${certTheme === 'crimson' ? 'active' : ''}" data-theme="crimson">
                <span class="theme-dot crimson"></span>
                <span>ក្រហមកំពូលរាជ្យ</span>
              </button>
              <button class="theme-btn ${certTheme === 'obsidian' ? 'active' : ''}" data-theme="obsidian">
                <span class="theme-dot obsidian"></span>
                <span>ខ្មៅមាសប្រណិត</span>
              </button>
            </div>
          </div>

          <div class="cert-toolbar-right">
            <!-- Signature Mode Adjuster (Digital vs Manual Pen) -->
            <div class="sig-mode-group" title="ជ្រើសរើសប្រភេទហត្ថលេខា">
              <span class="sig-mode-label">ហត្ថលេខា៖</span>
              <button class="sig-btn active" data-sig="digital" id="sigModeDigitalBtn">🖊️ ឌីជីថល</button>
              <button class="sig-btn" data-sig="manual" id="sigModeManualBtn">✍️ សញ៉េផ្ទាល់ដៃ</button>
            </div>

            <!-- Photo Mode: Digital vs 4x6 Paste Frame vs None -->
            <div class="photo-mode-group" title="ជ្រើសរើសប្រភេទរូបថតលើវិញ្ញាបនបត្រ">
              <span class="photo-mode-label">រូបថត៖</span>
              <button class="photo-mode-btn ${photoMode === 'digital' ? 'active' : ''}" data-mode="digital" id="photoModeDigitalBtn" title="ប្រើរូបថតឌីជីថល (អាចអូសតម្រឹមបាន)">
                <span>🖼️ រូបឌីជីថល</span>
              </button>
              <button class="photo-mode-btn ${photoMode === 'paste4x6' ? 'active' : ''}" data-mode="paste4x6" id="photoModePasteBtn" title="ប្រអប់ស្ដង់ដារសម្រាប់បិទរូបថត 4x6 ដោយដៃពេលបោះពុម្ព">
                <span>🔲 ប្រអប់បិទ 4x6</span>
              </button>
              <button class="photo-mode-btn ${photoMode === 'none' ? 'active' : ''}" data-mode="none" id="photoModeNoneBtn" title="មិនដាក់រូបថតលើវិញ្ញាបនបត្រ">
                <span>🚫 គ្មានរូប</span>
              </button>
            </div>

            <!-- Photo Size Adjuster (for Digital Frame) -->
            <div class="size-btn-group" id="photoSizeBtnGroup" style="${photoMode === 'digital' ? 'display: inline-flex;' : 'display: none;'}" title="កែសម្រួលទំហំប្រអប់រូបថតសិស្ស">
              <span class="size-btn-label">ទំហំប្រអប់៖</span>
              <button class="size-btn" data-size="sm">តូច</button>
              <button class="size-btn active" data-size="md">ស្តង់ដារ</button>
              <button class="size-btn" data-size="lg">ធំ</button>
            </div>

            <!-- Photo Framing & Drag Adjuster (for Digital Frame) -->
            <div class="photo-adjust-group" id="photoAdjustGroup" style="${photoMode === 'digital' ? 'display: inline-flex;' : 'display: none;'}" title="ទាញតម្រឹម និងពង្រីក/បង្រួមរូបភាព">
              <span class="photo-adjust-label">🖼️ ទាញរូប៖</span>
              <button class="photo-adj-btn" id="photoZoomOutBtn" title="បង្រួម (Zoom Out)">➖</button>
              <span class="photo-zoom-val" id="photoZoomVal">100%</span>
              <button class="photo-adj-btn" id="photoZoomInBtn" title="ពង្រីក (Zoom In)">➕</button>
              <button class="photo-adj-btn" id="photoResetBtn" title="កំណត់ទីតាំងដើម (Reset)">↺ ដើម</button>
              <div class="photo-nudge-group">
                <button class="photo-nudge-btn" id="nudgeUpBtn" title="រំកិលឡើងលើ">▲</button>
                <button class="photo-nudge-btn" id="nudgeDownBtn" title="រំកិលចុះក្រោម">▼</button>
                <button class="photo-nudge-btn" id="nudgeLeftBtn" title="រំកិលទៅឆ្វេង">◀</button>
                <button class="photo-nudge-btn" id="nudgeRightBtn" title="រំកិលទៅស្ដាំ">▶</button>
              </div>
            </div>

            <label class="btn btn-outline btn-sm" id="changeCertPhotoLabel" style="${photoMode === 'digital' ? 'display: inline-flex;' : 'display: none;'} cursor: pointer;" title="ផ្លាស់ប្ដូររូបថតសិស្សលើវិញ្ញាបនបត្រ">
              <span>📷 ដាក់រូបថតសិស្ស</span>
              <input type="file" id="changeCertPhotoInput" accept="image/*" style="display: none;" />
            </label>
            <button class="btn btn-outline btn-sm" id="verifyCurrentCertBtn">
              <span>🔍 ផ្ទៀងផ្ទាត់ QR</span>
            </button>
            <button class="btn btn-outline-gold btn-sm" id="downloadCertImageBtn">
              <span>📥 ទាញយករូបភាព HD (PNG)</span>
            </button>
            <button class="btn btn-gold btn-sm" id="printCertBtn">
              <span>🖨️ បោះពុម្ព A4 Landscape</span>
            </button>
          </div>
        </div>

        <!-- Issue Date & Location Control Bar (កែសម្រួលទីកន្លែង និងកាលបរិច្ឆេទចេញវិញ្ញាបនបត្រ) -->
        <div class="cert-issue-bar no-print" style="display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.9)); border: 1px solid rgba(217, 119, 6, 0.4); border-radius: var(--radius-md); padding: 10px 18px; margin-bottom: 18px; flex-wrap: wrap; gap: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.25);">
          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            <!-- Location Input -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 13.5px; color: var(--gold-300); font-weight: 600;">📍 ទីកន្លែងចេញ៖</span>
              <input type="text" id="certIssueLocationInput" class="form-control" 
                     value="${certLocation}" 
                     placeholder="ឧ. រាជធានីភ្នំពេញ ឬ ខេត្តសៀមរាប..." 
                     list="khmerProvincesDatalist"
                     style="width: 185px; padding: 6px 12px; font-size: 13.5px; height: 36px; background: rgba(0,0,0,0.3); border-color: rgba(217, 119, 6, 0.4);" />
              <datalist id="khmerProvincesDatalist">
                <option value="រាជធានីភ្នំពេញ"></option>
                <option value="ខេត្តកណ្តាល"></option>
                <option value="ខេត្តសៀមរាប"></option>
                <option value="ខេត្តបាត់ដំបង"></option>
                <option value="ខេត្តព្រះសីហនុ"></option>
                <option value="ខេត្តកំពង់ចាម"></option>
                <option value="ខេត្តកំពង់ឆ្នាំង"></option>
                <option value="ខេត្តកំពង់ស្ពឺ"></option>
                <option value="ខេត្តកំពត"></option>
                <option value="ខេត្តតាកែវ"></option>
                <option value="ខេត្តពោធិ៍សាត់"></option>
                <option value="ខេត្តបន្ទាយមានជ័យ"></option>
                <option value="ខេត្តស្វាយរៀង"></option>
                <option value="ខេត្តព្រៃវែង"></option>
              </datalist>
            </div>

            <!-- Date Picker -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 13.5px; color: var(--gold-300); font-weight: 600;">📅 ថ្ងៃខែឆ្នាំចេញ៖</span>
              <input type="date" id="certIssueDateInput" class="form-control" 
                     value="${certDateIso}" 
                     style="width: 155px; padding: 6px 10px; font-size: 13.5px; height: 36px; background: rgba(0,0,0,0.3); border-color: rgba(217, 119, 6, 0.4);" />
            </div>

            <button class="btn btn-outline-gold btn-sm" id="certSaveIssueInfoBtn" title="រក្សាទុកទីកន្លែង និងកាលបរិច្ឆេទចូល Database">
              <span>💾 រក្សាទុកកាលបរិច្ឆេទ</span>
            </button>
          </div>

          <div style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            <span>បង្ហាញលើសញ្ញាបត្រ៖ </span>
            <strong id="certPreviewDateText" style="color: var(--gold-300); font-size: 13.5px;">${certDateKh}</strong>
          </div>
        </div>

        <!-- The Printable Certificate Container -->
        <div class="cert-canvas-container">
          <div class="khmer-certificate theme-${certTheme}" id="khmerCertificateElement">
            <!-- Outer & Inner Golden Decorative Frames -->
            <div class="cert-frame-outer"></div>
            <div class="cert-frame-inner"></div>

            <!-- Traditional Khmer Ornate Corners (SVG) -->
            <img src="/assets/khmer-corner.svg" class="cert-corner-kbach tl" alt="Corner" />
            <img src="/assets/khmer-corner.svg" class="cert-corner-kbach tr" alt="Corner" />
            <img src="/assets/khmer-corner.svg" class="cert-corner-kbach bl" alt="Corner" />
            <img src="/assets/khmer-corner.svg" class="cert-corner-kbach br" alt="Corner" />

            <!-- Subtle Background Watermark (Digital Industry Circular Logo) -->
            <img src="/assets/digital-industry-logo-round.png" class="cert-watermark" style="border-radius: 50%; opacity: 0.08; width: 350px; height: 350px; object-fit: cover;" alt="Digital Industry Watermark" />

            <!-- Main Inner Certificate Content -->
            <div class="cert-inner-content">
              <!-- Header: Royal Kingdom Motto (Centered, No Commercial Logo) & Institute -->
              <div class="cert-top-header">
                <div class="cert-country-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div class="cert-motto">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                <img src="/assets/cambodia-divider.svg" class="cert-divider-img" alt="Divider" />
                <div class="cert-institute-kh">មជ្ឈមណ្ឌលបណ្តុះបណ្តាល Digital Industry</div>
                <div class="cert-institute-en">DIGITAL INDUSTRY TRAINING CENTER</div>
              </div>

              <!-- Certificate Title -->
              <div class="cert-title-area">
                <div class="cert-main-title-kh">វិញ្ញាបនបត្របញ្ជាក់ការសិក្សា</div>
                <div class="cert-main-title-en">CERTIFICATE OF COMPLETION</div>
              </div>

              <!-- Recipient Info & Statement (Centered & Symmetrical) -->
              <div class="cert-body-centered">
                <div class="cert-present-text">
                  វិញ្ញាបនបត្រនេះត្រូវបានប្រគល់ជូនដល់ / THIS CERTIFICATE IS PROUDLY PRESENTED TO
                </div>
                <div class="cert-recipient-box">
                  <div class="cert-recipient-kh">${currentStudent.nameKh}</div>
                  <div class="cert-recipient-en">${currentStudent.nameEn}</div>
                </div>

                <!-- Course Achievement Statement -->
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
                    ${currentStudent.grades ? `ទទួលបាន <strong>${currentStudent.grades.gradeKh}</strong> (ពិន្ទុ ${toKhmerNum(currentStudent.grades.totalScore)}/១០០)` : ''}
                  </div>
                </div>
              </div>

              <!-- Bottom Grid: Left (Trainer Signature), Center (Student Photo), Right (QR Code) -->
              <div class="cert-bottom-grid" id="certBottomGrid">
                <!-- Left: Date & Trainer Born Chantha Signature (Digital or Manual Space) -->
                <div class="cert-sign-block">
                  <div class="cert-sign-date" id="certSignDateElement" title="ចុចដើម្បីកែប្រែទីកន្លែង និងកាលបរិច្ឆេទ (Click to edit location & date)" style="cursor: pointer;">${certDateKh}</div>
                  <div class="cert-sign-title">គ្រូបណ្តុះបណ្តាល (Training Instructor)</div>
                  
                  <!-- Digital Signature Image -->
                  <img src="/assets/born-chantha-signature.png" class="cert-signature-img" id="certSignatureImg" alt="ហត្ថលេខា លោក ប៊ន ចន្ថា" />
                  
                  <!-- Manual Signature Space for pen signing on printed paper -->
                  <div class="cert-sign-manual-area" id="certSignManualArea" style="display: none;">
                    <div class="cert-sign-manual-dots">................................................</div>
                    <div class="cert-sign-manual-hint no-print">(កន្លែងចុះហត្ថលេខាផ្ទាល់ដៃដោយប៊ិក)</div>
                  </div>

                  <div class="cert-sign-name">លោក ប៊ន ចន្ថា (BORN CHANTHA)</div>
                </div>

                <!-- Center: Framed Student Official Photo (Digital Photo vs 4x6 Attachment Box) -->
                <div class="cert-student-photo-col" id="certStudentPhotoCol" style="${photoMode === 'none' ? 'display: none;' : ''}">
                  <!-- Mode 1: Digital Photo Frame (Draggable, Zoomable & Resizable) -->
                  <div class="cert-student-photo-frame size-md" id="certStudentPhotoBox" style="${photoMode === 'paste4x6' ? 'display: none;' : ''}" title="ចុច និងអូសរូបភាពផ្ទាល់ដើម្បីតម្រឹមក្នុងប្រអប់ (Click & Drag Photo)">
                    <div class="cert-photo-inner" id="certPhotoInner">
                      <div class="cert-photo-drag-hint">✋ អូសតម្រឹម</div>
                      <img src="${currentStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}" class="cert-student-photo-img" id="certPhotoElement" alt="រូបថត ${currentStudent.nameKh}" draggable="false" />
                      <div class="cert-photo-id-tag">${currentStudent.id}</div>
                    </div>
                  </div>

                  <!-- Mode 2: Official 4x6 cm Physical Photo Attachment Placeholder Box -->
                  <div class="cert-photo-paste-4x6" id="certPhotoPaste4x6" style="${photoMode === 'paste4x6' ? 'display: flex;' : 'display: none;'}" title="កន្លែងសម្រាប់បិទរូបថតទំហំ 4x6 cm លើក្រដាសបោះពុម្ព">
                    <div class="paste-4x6-corners">
                      <span class="corner tl"></span>
                      <span class="corner tr"></span>
                      <span class="corner bl"></span>
                      <span class="corner br"></span>
                    </div>
                    <div class="paste-4x6-content">
                      <div class="paste-icon">📷</div>
                      <div class="paste-title">រូបថត 4x6</div>
                      <div class="paste-sub">កន្លែងបិទរូបថត</div>
                      <div class="paste-id">${currentStudent.id}</div>
                    </div>
                  </div>
                </div>

                <!-- Right: Live QR Code & Certificate Reference Number -->
                <div class="cert-qr-block">
                  <img id="certLiveQrImage" class="cert-qr-img" src="" alt="QR Code" />
                  <div class="cert-no-label">លេខវិញ្ញាបនបត្រ (Ref No.)</div>
                  <div class="cert-no-val" id="certDisplayNo">${currentStudent.certificate?.certificateNo || 'CERT-DI-2026-0000'}</div>
                  <div style="font-size: 9.5px; color: #64748B; margin-top: 2px; font-family: var(--font-latin);">
                    SCAN TO VERIFY AUTHENTICITY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initCertificateEvents(onNavigate, showToast, currentStudentId) {
  // Go to grade if no cert
  document.getElementById('noCertGoToGradeBtn')?.addEventListener('click', () => {
    onNavigate('admin-grading');
  });

  const studentSelector = document.getElementById('certStudentSelector');
  const certElement = document.getElementById('khmerCertificateElement');
  const qrImage = document.getElementById('certLiveQrImage');

  // Generate real QR code for current student
  async function updateCertQR() {
    if (!qrImage) return;
    const selectedId = studentSelector?.value || currentStudentId || 'STU-2026-001';
    const student = store.getStudentById(selectedId);
    const certNo = student?.certificate?.certificateNo || `CERT-${selectedId}`;

    // Verification URL containing certificate ID
    const hostBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'https://studentdinetwork.web.app'
      : window.location.origin;
    const verifyUrl = `${hostBase}/#verify?certNo=${encodeURIComponent(certNo)}&studentId=${encodeURIComponent(selectedId)}`;
    const qrDataUrl = await generateQRCode(verifyUrl, { width: 160 });
    qrImage.src = qrDataUrl;
  }

  updateCertQR();

  // --- Issue Location & Date Live Editing ---
  const locationInput = document.getElementById('certIssueLocationInput');
  const dateInput = document.getElementById('certIssueDateInput');
  const saveIssueBtn = document.getElementById('certSaveIssueInfoBtn');
  const previewDateText = document.getElementById('certPreviewDateText');
  const certSignDateElement = document.getElementById('certSignDateElement');

  function updateCertDateDisplay() {
    const loc = locationInput?.value || 'រាជធានីភ្នំពេញ';
    const dateVal = dateInput?.value || new Date().toISOString().split('T')[0];
    const formatted = formatKhmerDate(dateVal, loc);
    if (certSignDateElement) certSignDateElement.textContent = formatted;
    if (previewDateText) previewDateText.textContent = formatted;
    return { loc, dateVal, formatted };
  }

  locationInput?.addEventListener('input', () => {
    updateCertDateDisplay();
  });

  dateInput?.addEventListener('change', () => {
    updateCertDateDisplay();
  });

  const handleSaveIssueInfo = async () => {
    const { loc, dateVal } = updateCertDateDisplay();
    const activeId = studentSelector?.value || currentStudentId;
    if (!activeId) return;

    await store.updateCertificateIssueInfo(activeId, {
      issueLocation: loc,
      issueDate: dateVal
    });

    updateCertQR();
    showToast(`បានកែសម្រួលទីកន្លែង (${loc}) និងកាលបរិច្ឆេទ (${dateVal}) ដោយជោគជ័យ!`, 'success');
  };

  saveIssueBtn?.addEventListener('click', handleSaveIssueInfo);
  locationInput?.addEventListener('change', handleSaveIssueInfo);

  // Clicking the date on the certificate directly highlights the location input
  certSignDateElement?.addEventListener('click', () => {
    locationInput?.focus();
    locationInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('លោកគ្រូអាចកែប្រែទីកន្លែង និងកាលបរិច្ឆេទចេញវិញ្ញាបនបត្រនៅប្រអប់ខាងលើនេះបាន!', 'info');
  });

  // Signature Mode Toggle (Digital vs Manual Pen on Paper)
  const sigImg = document.getElementById('certSignatureImg');
  const sigManualArea = document.getElementById('certSignManualArea');
  document.querySelectorAll('.sig-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.sig-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const sigMode = e.currentTarget.getAttribute('data-sig');

      if (sigMode === 'manual') {
        if (sigImg) sigImg.classList.add('hidden');
        if (sigManualArea) sigManualArea.style.display = 'flex';
        showToast('បានជ្រើសរើសម៉ូដ៖ សញ៉េផ្ទាល់ដៃដោយប៊ិកលើក្រដាសពេល Print A4', 'info');
      } else {
        if (sigImg) sigImg.classList.remove('hidden');
        if (sigManualArea) sigManualArea.style.display = 'none';
        showToast('បានជ្រើសរើសម៉ូដ៖ ហត្ថលេខាឌីជីថលពិតប្រាកដ (លោកគ្រូ ប៊ន ចន្ថា)', 'info');
      }
    });
  });

  // Photo Sizing Buttons (sm / md / lg)
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const size = e.currentTarget.getAttribute('data-size');
      const photoBox = document.getElementById('certStudentPhotoBox');
      if (photoBox) {
        photoBox.classList.remove('size-sm', 'size-md', 'size-lg');
        photoBox.classList.add(`size-${size}`);
      }
      showToast(`បានប្ដូរទំហំរូបថតទៅជា៖ ${size === 'sm' ? 'តូច' : size === 'lg' ? 'ធំ' : 'ស្តង់ដារ'}`, 'info');
    });
  });

  // --- Interactive Student Photo Dragging, Zooming & Framing Adjuster ---
  const photoInner = document.getElementById('certPhotoInner');
  const photoImg = document.getElementById('certPhotoElement');
  const photoZoomVal = document.getElementById('photoZoomVal');

  const getActiveStudent = () => {
    const activeId = studentSelector?.value || currentStudentId;
    return activeId ? store.getStudentById(activeId) : null;
  };

  const initialStudent = getActiveStudent();
  let posX = initialStudent?.photoConfig?.x || 0;
  let posY = initialStudent?.photoConfig?.y || 0;
  let zoom = initialStudent?.photoConfig?.zoom || 1.0;

  function applyPhotoTransform() {
    if (photoImg) {
      photoImg.style.transform = `translate(${posX}px, ${posY}px) scale(${zoom})`;
    }
    if (photoZoomVal) {
      photoZoomVal.textContent = `${Math.round(zoom * 100)}%`;
    }
  }

  // Initial apply
  applyPhotoTransform();

  let saveTimer = null;
  function savePhotoConfig() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const activeId = studentSelector?.value || currentStudentId;
      if (activeId) {
        store.updateStudent(activeId, { photoConfig: { x: posX, y: posY, zoom } });
      }
    }, 300);
  }

  // Mouse & Touch Dragging
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  photoInner?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    dragStartX = e.clientX - posX;
    dragStartY = e.clientY - posY;
    photoInner.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - dragStartX;
    posY = e.clientY - dragStartY;
    applyPhotoTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      photoInner?.classList.remove('is-dragging');
      savePhotoConfig();
    }
  });

  // Touch Dragging Support
  photoInner?.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX - posX;
      dragStartY = e.touches[0].clientY - posY;
      photoInner.classList.add('is-dragging');
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    posX = e.touches[0].clientX - dragStartX;
    posY = e.touches[0].clientY - dragStartY;
    applyPhotoTransform();
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
      photoInner?.classList.remove('is-dragging');
      savePhotoConfig();
    }
  });

  // Mouse Wheel Zoom
  photoInner?.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.06 : -0.06;
    zoom = Math.min(3.0, Math.max(0.5, Math.round((zoom + delta) * 100) / 100));
    applyPhotoTransform();
    savePhotoConfig();
  }, { passive: false });

  // Zoom Buttons (+ / -)
  document.getElementById('photoZoomInBtn')?.addEventListener('click', () => {
    zoom = Math.min(3.0, Math.round((zoom + 0.1) * 10) / 10);
    applyPhotoTransform();
    savePhotoConfig();
  });

  document.getElementById('photoZoomOutBtn')?.addEventListener('click', () => {
    zoom = Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10);
    applyPhotoTransform();
    savePhotoConfig();
  });

  // Reset Button (↺)
  document.getElementById('photoResetBtn')?.addEventListener('click', () => {
    posX = 0;
    posY = 0;
    zoom = 1.0;
    applyPhotoTransform();
    savePhotoConfig();
    showToast('បានកំណត់ទីតាំង និងទំហំរូបថតទៅសភាពដើម', 'info');
  });

  // Nudge Direction Buttons
  const step = 4;
  document.getElementById('nudgeUpBtn')?.addEventListener('click', () => {
    posY -= step;
    applyPhotoTransform();
    savePhotoConfig();
  });
  document.getElementById('nudgeDownBtn')?.addEventListener('click', () => {
    posY += step;
    applyPhotoTransform();
    savePhotoConfig();
  });
  document.getElementById('nudgeLeftBtn')?.addEventListener('click', () => {
    posX -= step;
    applyPhotoTransform();
    savePhotoConfig();
  });
  document.getElementById('nudgeRightBtn')?.addEventListener('click', () => {
    posX += step;
    applyPhotoTransform();
    savePhotoConfig();
  });

  // Change Student Photo Live on Certificate
  const photoInput = document.getElementById('changeCertPhotoInput');
  photoInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (photoImg && dataUrl) {
        photoImg.src = dataUrl;
        posX = 0;
        posY = 0;
        zoom = 1.0;
        applyPhotoTransform();

        const selectedId = studentSelector?.value || currentStudentId;
        if (selectedId) {
          store.updateStudent(selectedId, { photoUrl: dataUrl, photoConfig: { x: 0, y: 0, zoom: 1.0 } });
          showToast('បានផ្លាស់ប្ដូររូបថតសិស្សលើវិញ្ញាបនបត្រជោគជ័យ! (អាចអូសតម្រឹមបាន)', 'success');
        }
      }
    };
    reader.readAsDataURL(file);
  });

  // Photo Mode Switcher (Digital vs 4x6 Paste Frame vs None)
  const photoBox = document.getElementById('certStudentPhotoBox');
  const photoPasteBox = document.getElementById('certPhotoPaste4x6');
  const photoCol = document.getElementById('certStudentPhotoCol');
  const bottomGrid = document.getElementById('certBottomGrid');
  const photoAdjustGroup = document.getElementById('photoAdjustGroup');
  const photoSizeGroup = document.getElementById('photoSizeBtnGroup');
  const uploadPhotoBtn = document.getElementById('changeCertPhotoLabel');

  document.querySelectorAll('.photo-mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.photo-mode-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const mode = e.currentTarget.getAttribute('data-mode');

      if (mode === 'digital') {
        if (photoCol) photoCol.style.display = 'flex';
        if (photoBox) photoBox.style.display = 'flex';
        if (photoPasteBox) photoPasteBox.style.display = 'none';
        if (bottomGrid) bottomGrid.style.gridTemplateColumns = '1.2fr 1fr 1.1fr';
        if (photoAdjustGroup) photoAdjustGroup.style.display = 'inline-flex';
        if (photoSizeGroup) photoSizeGroup.style.display = 'inline-flex';
        if (uploadPhotoBtn) uploadPhotoBtn.style.display = 'inline-flex';
        showToast('បានជ្រើសរើសម៉ូដ៖ រូបថតឌីជីថល (អាចអូសតម្រឹមបាន)', 'info');
      } else if (mode === 'paste4x6') {
        if (photoCol) photoCol.style.display = 'flex';
        if (photoBox) photoBox.style.display = 'none';
        if (photoPasteBox) photoPasteBox.style.display = 'flex';
        if (bottomGrid) bottomGrid.style.gridTemplateColumns = '1.2fr 1fr 1.1fr';
        if (photoAdjustGroup) photoAdjustGroup.style.display = 'none';
        if (photoSizeGroup) photoSizeGroup.style.display = 'none';
        if (uploadPhotoBtn) uploadPhotoBtn.style.display = 'none';
        showToast('បានជ្រើសរើសម៉ូដ៖ ប្រអប់ស្ដង់ដារសម្រាប់បិទរូបថត 4x6 ដោយដៃពេល Print ក្រដាស', 'gold');
      } else { // 'none'
        if (photoCol) photoCol.style.display = 'none';
        if (photoBox) photoBox.style.display = 'none';
        if (photoPasteBox) photoPasteBox.style.display = 'none';
        if (bottomGrid) bottomGrid.style.gridTemplateColumns = '1.2fr 1.1fr';
        if (photoAdjustGroup) photoAdjustGroup.style.display = 'none';
        if (photoSizeGroup) photoSizeGroup.style.display = 'none';
        if (uploadPhotoBtn) uploadPhotoBtn.style.display = 'none';
        showToast('បានលាក់រូបថតលើវិញ្ញាបនបត្រ', 'warning');
      }

      const activeId = studentSelector?.value || currentStudentId;
      if (activeId) {
        store.updateStudent(activeId, { photoMode: mode });
      }
    });
  });

  // Student Selector Change
  studentSelector?.addEventListener('change', (e) => {
    const studentId = e.currentTarget.value;
    onNavigate('certificate', { studentId });
  });

  // Theme Switcher Buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      const theme = e.currentTarget.getAttribute('data-theme');
      if (certElement) {
        certElement.className = `khmer-certificate theme-${theme}`;
      }

      // Save theme preference to student certificate
      const selectedId = studentSelector?.value || currentStudentId;
      if (selectedId) {
        const student = store.getStudentById(selectedId);
        if (student && student.certificate) {
          student.certificate.theme = theme;
          store.updateStudent(selectedId, { certificate: student.certificate });
        }
      }
    });
  });

  // Print Certificate Button
  document.getElementById('printCertBtn')?.addEventListener('click', () => {
    printCertificate();
  });

  // Download HD Image Button
  document.getElementById('downloadCertImageBtn')?.addEventListener('click', async () => {
    showToast('កំពុងរៀបចំទាញយករូបភាពវិញ្ញាបនបត្រកម្រិតច្បាស់ (HD)...', 'gold');
    const selectedId = studentSelector?.value || currentStudentId;
    const student = store.getStudentById(selectedId);
    const filename = `វិញ្ញាបនបត្រ_${student ? student.nameKh.replace(/\s+/g, '_') : 'Khmer_Cert'}.png`;

    const success = await downloadCertificateAsImage('khmerCertificateElement', filename);
    if (success) {
      showToast('បានទាញយករូបភាពវិញ្ញាបនបត្រជោគជ័យ!', 'success');
    }
  });

  // Verify Current Cert Button
  document.getElementById('verifyCurrentCertBtn')?.addEventListener('click', () => {
    const selectedId = studentSelector?.value || currentStudentId;
    const student = store.getStudentById(selectedId);
    onNavigate('verify', { certNo: student?.certificate?.certificateNo, studentId: selectedId });
  });
}
