import confetti from 'canvas-confetti';
import { store } from '../store.js';
import { toKhmerNum } from '../utils/khmerNumbers.js';

export function renderRegisterView(params = {}) {
  const publishedCourses = store.getCourses(false); // Only courses published by admin!
  const preselectedCourseId = params.selectedCourseId || (publishedCourses.length > 0 ? publishedCourses[0].id : '');

  return `
    <div class="container" style="padding: 40px 24px 80px; max-width: 860px;">
      <div style="text-align: center; margin-bottom: 36px;">
        <div class="badge badge-gold" style="margin-bottom: 12px;">📝 បំពេញពាក្យសុំចូលរៀន</div>
        <h1 style="font-size: 32px; margin-bottom: 10px;">
          ទម្រង់ចុះឈ្មោះសិស្សចូលរៀន
        </h1>
        <p style="color: var(--text-muted); font-size: 15px;">
          សូមបំពេញព័ត៌មានអោយបានត្រឹមត្រូវ ជាពិសេសឈ្មោះជាភាសាខ្មែរ និងអក្សរឡាតាំង ដើម្បីងាយស្រួលបោះពុម្ពលើវិញ្ញាបនបត្រ។
        </p>
      </div>

      ${publishedCourses.length === 0 ? `
        <div class="form-card" style="text-align: center; padding: 50px 30px;">
          <div style="font-size: 52px; margin-bottom: 16px;">⚠️</div>
          <h2 style="font-size: 22px; margin-bottom: 12px; color: var(--gold-300);">
            មិនទាន់មានវគ្គសិក្សាសម្រាប់ចុះឈ្មោះនៅឡើយទេ
          </h2>
          <p style="color: var(--text-muted); max-width: 520px; margin: 0 auto 24px; line-height: 1.7;">
            តាមគោលការណ៍ប្រព័ន្ធ៖ <strong>Admin ត្រូវតែចូលទៅបង្កើត និងបើកទទួលពាក្យ (Publish) លើវគ្គសិក្សាជាមុនសិន</strong> ទើបមានវគ្គសិក្សាបង្ហាញក្នុងតារាងជ្រើសរើសចុះឈ្មោះនេះ។
          </p>
          <button class="btn btn-gold" id="regGoToAdminCourseBtn">
            <span>⚙️ ចូលទៅបង្កើតវគ្គសិក្សា (Admin Portal)</span>
          </button>
        </div>
      ` : `
        <div class="form-card">
          <form id="studentRegistrationForm">
            <!-- Section 1: Personal Info -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
              <span style="color: var(--gold-400); font-size: 18px;">👤</span>
              <h3 style="font-size: 18px; color: #fff;">១. ព័ត៌មានផ្ទាល់ខ្លួនរបស់សិស្ស</h3>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="regNameKh">
                  ឈ្មោះជាភាសាខ្មែរ <span class="req">*</span>
                  <span class="form-label-hint">(ឧ. សុខ ចាន់ថន)</span>
                </label>
                <input 
                  type="text" 
                  id="regNameKh" 
                  class="form-control" 
                  placeholder="ឧ. សុខ ចាន់ថន" 
                  required 
                  autocomplete="name"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="regNameEn">
                  ឈ្មោះជាអក្សរឡាតាំង (ធំ) <span class="req">*</span>
                  <span class="form-label-hint">(សម្រាប់លើវិញ្ញាបនបត្រ)</span>
                </label>
                <input 
                  type="text" 
                  id="regNameEn" 
                  class="form-control" 
                  placeholder="ឧ. SOK CHANTHORN" 
                  style="text-transform: uppercase;" 
                  required 
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="regGender">
                  ភេទ <span class="req">*</span>
                </label>
                <select id="regGender" class="form-control" required>
                  <option value="ប្រុស">ប្រុស (Male)</option>
                  <option value="ស្រី">ស្រី (Female)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="regDob">
                  ថ្ងៃខែឆ្នាំកំណើត <span class="req">*</span>
                </label>
                <input type="date" id="regDob" class="form-control" required />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="regPhone">
                  លេខទូរស័ព្ទ / Telegram <span class="req">*</span>
                </label>
                <input 
                  type="tel" 
                  id="regPhone" 
                  class="form-control" 
                  placeholder="ឧ. 012 345 678" 
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="regEmail">
                  អ៊ីមែល (Email)
                </label>
                <input 
                  type="email" 
                  id="regEmail" 
                  class="form-control" 
                  placeholder="ឧ. example@gmail.com" 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="regAddress">
                រាជធានី / ខេត្តបច្ចុប្បន្ន <span class="req">*</span>
              </label>
              <select id="regAddress" class="form-control" required>
                <option value="រាជធានីភ្នំពេញ">រាជធានីភ្នំពេញ</option>
                <option value="ខេត្តកណ្តាល">ខេត្តកណ្តាល</option>
                <option value="ខេត្តសៀមរាប">ខេត្តសៀមរាប</option>
                <option value="ខេត្តបាត់ដំបង">ខេត្តបាត់ដំបង</option>
                <option value="ខេត្តកំពង់ចាម">ខេត្តកំពង់ចាម</option>
                <option value="ខេត្តព្រះសីហនុ">ខេត្តព្រះសីហនុ</option>
                <option value="ខេត្តកំពត">ខេត្តកំពត</option>
                <option value="ខេត្តតាកែវ">ខេត្តតាកែវ</option>
                <option value="ខេត្តព្រៃវែង">ខេត្តព្រៃវែង</option>
                <option value="ខេត្តស្វាយរៀង">ខេត្តស្វាយរៀង</option>
                <option value="ខេត្តកំពង់ធំ">ខេត្តកំពង់ធំ</option>
                <option value="ខេត្តកំពង់ស្ពឺ">ខេត្តកំពង់ស្ពឺ</option>
                <option value="ខេត្តបន្ទាយមានជ័យ">ខេត្តបន្ទាយមានជ័យ</option>
                <option value="ខេត្តពោធិ៍សាត់">ខេត្តពោធិ៍សាត់</option>
                <option value="ខេត្តផ្សេងៗ">ខេត្តផ្សេងៗ</option>
              </select>
            </div>

            <!-- Student Photo Upload Section -->
            <div class="form-group" style="background: rgba(255, 255, 255, 0.03); padding: 18px; border-radius: var(--radius-md); border: 1px dashed rgba(212, 175, 55, 0.4);">
              <label class="form-label" style="display: flex; align-items: center; justify-content: space-between;">
                <span>📷 រូបថតសិស្ស (សម្រាប់ដាក់លើវិញ្ញាបនបត្រ & ប័ណ្ណសិស្ស)</span>
                <span class="badge badge-gold" style="font-size: 11px;">រូបថត 4x6</span>
              </label>
              
              <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                <div style="width: 80px; height: 104px; border-radius: 6px; border: 2px solid var(--gold-400); overflow: hidden; background: #070d19; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); flex-shrink: 0;">
                  <img id="regPhotoPreview" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" style="width: 100%; height: 100%; object-fit: cover;" alt="Preview" />
                </div>

                <div style="flex-grow: 1;">
                  <input type="file" id="regPhotoInput" class="form-control" accept="image/*" style="padding: 8px 12px; font-size: 13.5px;" />
                  <div style="font-size: 12px; color: var(--text-dim); margin-top: 6px;">
                    សូមជ្រើសរើសរូបថតផ្ទៃមុខច្បាស់ អាចជារូប 4x6 ឬរូបបញ្ឈរ (JPG, PNG, WEBP)
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Course Selection (Only Admin-created & published) -->
            <div style="display: flex; align-items: center; gap: 10px; margin: 36px 0 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
              <span style="color: var(--gold-400); font-size: 18px;">🎓</span>
              <h3 style="font-size: 18px; color: #fff;">២. ជ្រើសរើសវគ្គសិក្សា និងវេនរៀន</h3>
            </div>

            <div class="form-group">
              <label class="form-label" for="regCourseSelect">
                ជ្រើសរើសវគ្គសិក្សា (វគ្គដែល Admin បានបង្កើត) <span class="req">*</span>
              </label>
              <select id="regCourseSelect" class="form-control" required style="font-size: 15.5px; font-weight: 500;">
                ${publishedCourses.map(c => `
                  <option value="${c.id}" ${c.id === preselectedCourseId ? 'selected' : ''}>
                    ${c.code} - ${c.titleKh} (${c.fee === 0 ? 'ឥតគិតថ្លៃ' : `$${c.fee}`} | ${toKhmerNum(c.hours)} ម៉ោង)
                  </option>
                `).join('')}
              </select>
              <div id="courseBriefInfo" style="margin-top: 10px; padding: 12px 16px; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 13.5px; color: #cbd5e1;"></div>
            </div>

            <div class="form-group">
              <label class="form-label">
                ជ្រើសរើសវេនសិក្សា (Preferred Shift) <span class="req">*</span>
              </label>
              <div class="shift-picker-grid">
                <label class="shift-option">
                  <input type="radio" name="shiftOption" value="វេនព្រឹក (៨:០០ - ៩:៣០ ព្រឹក)" checked />
                  <div class="shift-option-card">
                    <span class="shift-name">🌅 វេនព្រឹក</span>
                    <span class="shift-time">ម៉ោង ៨:០០ - ៩:៣០ ព្រឹក</span>
                  </div>
                </label>

                <label class="shift-option">
                  <input type="radio" name="shiftOption" value="វេនរសៀល (២:០០ - ៣:៣០ រសៀល)" />
                  <div class="shift-option-card">
                    <span class="shift-name">☀️ វេនរសៀល</span>
                    <span class="shift-time">ម៉ោង ២:០០ - ៣:៣០ រសៀល</span>
                  </div>
                </label>

                <label class="shift-option">
                  <input type="radio" name="shiftOption" value="វេនយប់ (៦:០០ - ៧:៣០ យប់)" />
                  <div class="shift-option-card">
                    <span class="shift-name">🌙 វេនយប់</span>
                    <span class="shift-time">ម៉ោង ៦:០០ - ៧:៣០ យប់</span>
                  </div>
                </label>

                <label class="shift-option">
                  <input type="radio" name="shiftOption" value="វេនចុងសប្តាហ៍ (សៅរ៍ - អាទិត្យ)" />
                  <div class="shift-option-card">
                    <span class="shift-name">📅 វេនចុងសប្តាហ៍</span>
                    <span class="shift-time">សៅរ៍ - អាទិត្យ (ពេញមួយថ្ងៃ)</span>
                  </div>
                </label>
              </div>
            </div>

            <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: flex-end; gap: 16px;">
              <button type="button" class="btn btn-outline" id="cancelRegBtn">
                <span>ថយក្រោយ</span>
              </button>
              <button type="submit" class="btn btn-gold btn-lg" id="submitRegBtn">
                <span>🚀 បញ្ជូនពាក្យចុះឈ្មោះ</span>
              </button>
            </div>
          </form>
        </div>
      `}

      <!-- Success Receipt Modal -->
      <div class="modal-backdrop" id="regSuccessModal">
        <div class="modal-content" style="max-width: 540px;">
          <div class="success-receipt-card">
            <div class="success-icon-badge">🎉</div>
            <h2 style="font-size: 22px; color: #fff; margin-bottom: 6px;">ចុះឈ្មោះបានជោគជ័យ!</h2>
            <p style="color: var(--text-muted); font-size: 14px;">
              ព័ត៌មានរបស់អ្នកត្រូវបានបញ្ជូនចូលក្នុងប្រព័ន្ធរួចរាល់ហើយ។
            </p>

            <div class="receipt-details-box" id="regReceiptContent">
              <!-- Dynamically filled on submit -->
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-outline btn-sm" id="printReceiptBtn">
                <span>🖨️ បោះពុម្ពប័ណ្ណ</span>
              </button>
              <button class="btn btn-primary btn-sm" id="viewInAdminBtn">
                <span>📋 មើលក្នុងបញ្ជីសិស្ស (Admin)</span>
              </button>
              <button class="btn btn-gold btn-sm" id="closeReceiptBtn">
                <span>យល់ព្រម</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initRegisterEvents(onNavigate) {
  const form = document.getElementById('studentRegistrationForm');
  const courseSelect = document.getElementById('regCourseSelect');
  const courseBrief = document.getElementById('courseBriefInfo');
  const emptyGoAdminBtn = document.getElementById('regGoToAdminCourseBtn');

  if (emptyGoAdminBtn) {
    emptyGoAdminBtn.addEventListener('click', () => onNavigate('admin-courses'));
  }

  // Update brief info when course changes
  function updateCourseBrief() {
    if (!courseSelect || !courseBrief) return;
    const selected = store.getCourseById(courseSelect.value);
    if (selected) {
      courseBrief.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <strong>${selected.titleKh}</strong>
          <span style="color: #34d399; font-weight: bold;">${selected.fee === 0 ? 'ឥតគិតថ្លៃ' : `$${selected.fee}`}</span>
        </div>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          គ្រូបង្រៀន៖ ${selected.instructor} | ម៉ោងសិក្សា៖ ${toKhmerNum(selected.hours)} ម៉ោង | កាលវិភាគ៖ ${selected.schedule}
        </div>
      `;
    }
  }

  if (courseSelect) {
    courseSelect.addEventListener('change', updateCourseBrief);
    updateCourseBrief();
  }

  // Photo upload preview handler
  let uploadedPhotoData = null;
  const photoInput = document.getElementById('regPhotoInput');
  const photoPreview = document.getElementById('regPhotoPreview');

  photoInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedPhotoData = event.target?.result;
      if (photoPreview && uploadedPhotoData) {
        photoPreview.src = uploadedPhotoData;
      }
    };
    reader.readAsDataURL(file);
  });

  // Handle Cancel
  document.getElementById('cancelRegBtn')?.addEventListener('click', () => {
    onNavigate('home');
  });

  // Handle Form Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameKh = document.getElementById('regNameKh').value;
      const nameEn = document.getElementById('regNameEn').value;
      const gender = document.getElementById('regGender').value;
      const dob = document.getElementById('regDob').value;
      const phone = document.getElementById('regPhone').value;
      const email = document.getElementById('regEmail').value;
      const address = document.getElementById('regAddress').value;
      const courseId = courseSelect.value;
      const shift = document.querySelector('input[name="shiftOption"]:checked')?.value;

      const registeredStudent = store.registerStudent({
        nameKh,
        nameEn,
        gender,
        dob,
        phone,
        email,
        address,
        courseId,
        shift,
        photoUrl: uploadedPhotoData || undefined
      });

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Fill Receipt Details
      const course = store.getCourseById(courseId);
      const receiptContent = document.getElementById('regReceiptContent');
      if (receiptContent) {
        receiptContent.innerHTML = `
          <div class="receipt-row">
            <span class="receipt-label">លេខសម្គាល់សិស្ស (Student ID):</span>
            <span class="receipt-val" style="color: var(--gold-300); font-family: var(--font-latin);">${registeredStudent.id}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">ឈ្មោះជាភាសាខ្មែរ:</span>
            <span class="receipt-val">${registeredStudent.nameKh}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">ឈ្មោះជាអក្សរឡាតាំង:</span>
            <span class="receipt-val" style="font-family: var(--font-latin);">${registeredStudent.nameEn}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">វគ្គសិក្សា:</span>
            <span class="receipt-val">${course ? course.titleKh : ''}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">វេនសិក្សា:</span>
            <span class="receipt-val">${registeredStudent.shift}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">លេខទូរស័ព្ទ:</span>
            <span class="receipt-val">${registeredStudent.phone}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">ស្ថានភាព:</span>
            <span class="receipt-val" style="color: #fbbf24;">រង់ចាំការបញ្ជាក់ចូលរៀន</span>
          </div>
        `;
      }

      // Show Modal
      const modal = document.getElementById('regSuccessModal');
      modal?.classList.add('open');

      // Modal Actions
      document.getElementById('closeReceiptBtn')?.addEventListener('click', () => {
        modal?.classList.remove('open');
        onNavigate('home');
      });

      document.getElementById('viewInAdminBtn')?.addEventListener('click', () => {
        modal?.classList.remove('open');
        onNavigate('admin-students');
      });

      document.getElementById('printReceiptBtn')?.addEventListener('click', () => {
        window.print();
      });
    });
  }
}
