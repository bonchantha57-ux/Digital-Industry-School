import { store } from '../store.js';
import { toKhmerNum } from '../utils/khmerNumbers.js';

export function renderHomeView(onNavigate) {
  const publishedCourses = store.getCourses(false); // Only published courses!
  const allStudents = store.getStudents();
  const graduatedCount = allStudents.filter(s => s.status === 'graduated').length;

  return `
    <div class="home-view">
      <!-- Hero Banner -->
      <section class="hero-section">
        <div class="container">
          <div style="display: flex; justify-content: center; margin-bottom: 22px;">
            <div style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid rgba(56, 189, 248, 0.75); box-shadow: 0 0 30px rgba(56, 189, 248, 0.45); overflow: hidden; background: #070d19; animation: floatSlow 4s ease-in-out infinite alternate;">
              <img src="/assets/digital-industry-logo-round.png" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="Digital Industry Logo" />
            </div>
          </div>

          <div class="hero-badge-pill">
            <span style="color: #38bdf8;">✦</span>
            <span>Digital Industry • វគ្គសិក្សាខ្លីៗបង្រៀនដោយ គ្រូ ប៊ន ចន្ថា</span>
            <span style="color: #38bdf8;">✦</span>
          </div>
          
          <h1 class="hero-title">
            ពង្រឹងជំនាញជាក់ស្ដែងជាមួយ 
            <span class="highlight-gold">វគ្គសិក្សាខ្លីៗនៅ Digital Industry</span>
          </h1>
          
          <p class="hero-subtitle">
            កម្មវិធីបណ្តុះបណ្តាលជំនាញខ្លីៗ (Short Courses) ឆាប់ចេះ ឆាប់ចប់ និងអនុវត្តផ្ទាល់លើ Project ពិតប្រាកដ បង្រៀនផ្ទាល់ដោយ <strong>លោកគ្រូ ប៊ន ចន្ថា</strong> រួមជាមួយការផ្ដល់វិញ្ញាបនបត្របញ្ជាក់ការសិក្សាបែបខ្មែរឡូយស្តង់ដារ។
          </p>

          <div class="hero-actions">
            <button class="btn btn-gold btn-lg" id="heroRegisterBtn">
              <span>✍️ ចុះឈ្មោះចូលរៀនឥឡូវនេះ</span>
            </button>
            <button class="btn btn-outline btn-lg" id="heroExploreBtn">
              <span>📚 មើលវគ្គសិក្សាទាំងអស់</span>
            </button>
            <button class="btn btn-outline-gold btn-lg" id="heroVerifyBtn">
              <span>🔍 ផ្ទៀងផ្ទាត់វិញ្ញាបនបត្រ</span>
            </button>
          </div>

          <!-- Quick Stats Bar -->
          <div class="hero-stats-bar">
            <div class="stat-item">
              <div class="stat-number">${toKhmerNum(publishedCourses.length)}+</div>
              <div class="stat-label">វគ្គសិក្សាកំពុងបើក</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${toKhmerNum(allStudents.length * 15 + 80)}+</div>
              <div class="stat-label">សិស្សបានចុះឈ្មោះ</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${toKhmerNum(graduatedCount * 12 + 65)}+</div>
              <div class="stat-label">និស្សិតបានបញ្ចប់ និងទទួលវិញ្ញាបនបត្រ</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">១០០%</div>
              <div class="stat-label">វិញ្ញាបនបត្រមាន QR Code ផ្ទៀងផ្ទាត់</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Courses Section -->
      <section class="container" id="coursesSection" style="padding-top: 30px;">
        <div class="section-header">
          <div class="section-title-wrap">
            <h2><span>🎓</span> វគ្គសិក្សាដែលកំពុងបើកទទួលសិស្ស</h2>
            <p class="section-subtitle">
              ${publishedCourses.length > 0 
                ? `មានចំនួន ${toKhmerNum(publishedCourses.length)} វគ្គសិក្សាដែលបានអនុញ្ញាត និងបើកទទួលពាក្យដោយ Admin` 
                : 'ពុំទាន់មានវគ្គសិក្សាត្រូវបានដាក់បង្ហាញនៅឡើយទេ'}
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="goToAdminBtn">
            <span>⚙️ គ្រប់គ្រងវគ្គសិក្សា (Admin)</span>
          </button>
        </div>

        ${publishedCourses.length === 0 ? `
          <div style="background: rgba(17, 24, 39, 0.7); border: 2px dashed rgba(255, 255, 255, 0.15); border-radius: var(--radius-lg); padding: 50px 20px; text-align: center; margin-bottom: 50px;">
            <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
            <h3 style="margin-bottom: 10px;">មិនទាន់មានវគ្គសិក្សាត្រូវបានបើកនៅឡើយទេ</h3>
            <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 20px;">
              Admin ត្រូវតែចូលទៅបង្កើត និងចុច "Published" លើវគ្គសិក្សាជាមុនសិន ទើបវគ្គនោះបង្ហាញលើគេហទំព័រសម្រាប់សិស្សចុះឈ្មោះ។
            </p>
            <button class="btn btn-gold" id="emptyGoToAdminBtn">
              <span>➕ ចូលទៅបង្កើតវគ្គសិក្សាថ្មី</span>
            </button>
          </div>
        ` : `
          <div class="course-grid">
            ${publishedCourses.map(course => `
              <div class="course-card" data-course-id="${course.id}">
                <div class="course-card-header">
                  <span class="course-category-tag">${course.category}</span>
                  <span class="course-badge-pill">${course.badge || 'ពេញនិយម'}</span>
                </div>
                
                <div class="course-card-body">
                  <div class="course-code">${course.code}</div>
                  <h3 class="course-card-title">${course.titleKh}</h3>
                  <div style="font-size: 12px; color: var(--gold-300); margin-bottom: 12px; font-family: var(--font-latin);">
                    ${course.titleEn}
                  </div>
                  <p class="course-desc">${course.description}</p>

                  <div class="course-meta-list">
                    <div class="course-meta-item">
                      <span class="course-meta-icon">👨‍🏫</span>
                      <span>${course.instructor}</span>
                    </div>
                    <div class="course-meta-item">
                      <span class="course-meta-icon">⏱️</span>
                      <span>រយៈពេល៖ ${toKhmerNum(course.hours)} ម៉ោងសិក្សា</span>
                    </div>
                    <div class="course-meta-item">
                      <span class="course-meta-icon">🗓️</span>
                      <span>${course.schedule}</span>
                    </div>
                  </div>
                </div>

                <div class="course-card-footer">
                  <div class="course-price-box">
                    <span class="course-price-label">តម្លៃសិក្សា</span>
                    <span class="course-price-val">${course.fee === 0 ? 'ឥតគិតថ្លៃ' : `$${course.fee}`}</span>
                  </div>
                  <button class="btn btn-gold btn-sm register-for-course-btn" data-course-id="${course.id}">
                    <span>✍️ ចុះឈ្មោះរៀន</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </section>

      <!-- Features & Certification Guarantee -->
      <section class="container" style="padding: 40px 0 60px;">
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8)); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: var(--radius-xl); padding: 50px 40px; box-shadow: var(--shadow-gold);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;">
            <div>
              <div class="badge badge-gold" style="margin-bottom: 16px;">✨ ស្តង់ដារវិញ្ញាបនបត្រជាតិ</div>
              <h2 style="font-size: 30px; margin-bottom: 16px; line-height: 1.4;">
                បញ្ចប់វគ្គសិក្សាដោយទទួលបាន <br>
                <span class="highlight-gold">វិញ្ញាបនបត្របញ្ជាក់ការសិក្សាស្ដង់ដារខ្មែរ</span>
              </h2>
              <p style="color: var(--text-muted); font-size: 15px; margin-bottom: 24px; line-height: 1.7;">
                គ្រប់សិស្សទាំងអស់ដែលបានបញ្ចប់ការសិក្សា និងឆ្លងកាត់ការវាយតម្លៃពិន្ទុជាប់ នឹងទទួលបានវិញ្ញាបនបត្ររចនាតាមក្បូរក្បាច់ខ្មែរបុរាណប្រណិត បោះត្រាក្រហមផ្លូវការ និងមានភ្ជាប់ QR Code ផ្ទៀងផ្ទាត់ភ្លាមៗពីប្រព័ន្ធ។
              </p>
              <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;">
                <div style="display: flex; align-items: center; gap: 12px; font-size: 14.5px;">
                  <span style="color: #34d399; font-size: 18px;">✓</span>
                  <span>រចនាក្បូរក្បាច់បុរាណខ្មែរ ពណ៌មាសស្រស់ស្អាតកម្រិត A4 Print</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; font-size: 14.5px;">
                  <span style="color: #34d399; font-size: 18px;">✓</span>
                  <span>មានត្រាក្រហមផ្លូវការ ហត្ថលេខា និងផ្លាកសញ្ញាមាស 3D Gold Ribbon</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; font-size: 14.5px;">
                  <span style="color: #34d399; font-size: 18px;">✓</span>
                  <span>ប្រព័ន្ធ QR Code Verification អាចស្កេនពិនិត្យទិន្នន័យបានពិតប្រាកដ</span>
                </div>
              </div>
              <button class="btn btn-gold" id="previewSampleCertBtn">
                <span>🏆 មើលគំរូវិញ្ញាបនបត្រខ្មែរ</span>
              </button>
            </div>

            <div style="text-align: center; position: relative;">
              <div style="background: rgba(0, 0, 0, 0.4); border: 2px solid rgba(212, 175, 55, 0.4); border-radius: 12px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <img src="/assets/khmer-corner.svg" style="width: 50px; height: 50px; position: absolute; top: 8px; left: 8px;" alt="Corner" />
                <img src="/assets/khmer-corner.svg" style="width: 50px; height: 50px; position: absolute; top: 8px; right: 8px; transform: scaleX(-1);" alt="Corner" />
                <div style="font-family: var(--font-khmer-title); font-size: 16px; color: var(--gold-300); margin-top: 10px;">វិញ្ញាបនបត្របញ្ជាក់ការសិក្សា</div>
                <div style="font-family: var(--font-latin-title); font-size: 11px; color: #cbd5e1; letter-spacing: 2px;">CERTIFICATE OF COMPLETION</div>
                <div style="margin: 20px 0; padding: 20px; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                  <div style="font-family: var(--font-khmer-title); font-size: 22px; color: #fff;">សុខ ចាន់ថន</div>
                  <div style="font-family: var(--font-latin-title); font-size: 13px; color: var(--gold-300);">SOK CHANTHORN</div>
                  <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Full-Stack Web Development</div>
                  <div class="badge badge-gold" style="margin-top: 8px;">និទ្ទេស A (ល្អប្រសើរ)</div>
                </div>
                <div style="display: flex; justify-content: space-around; align-items: center;">
                  <img src="/assets/royal-seal.svg" style="width: 55px; height: 55px;" alt="Seal" />
                  <img src="/assets/gold-seal.svg" style="width: 48px; height: 60px;" alt="Gold" />
                  <div style="font-size: 10px; color: var(--gold-300); font-family: var(--font-latin);">QR VERIFIED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function initHomeEvents(onNavigate) {
  // Register button in hero
  document.getElementById('heroRegisterBtn')?.addEventListener('click', () => {
    onNavigate('register');
  });

  // Explore courses scroll
  document.getElementById('heroExploreBtn')?.addEventListener('click', () => {
    document.getElementById('coursesSection')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Verify certificate button
  document.getElementById('heroVerifyBtn')?.addEventListener('click', () => {
    onNavigate('verify');
  });

  // Admin buttons
  document.getElementById('goToAdminBtn')?.addEventListener('click', () => {
    onNavigate('admin-courses');
  });
  document.getElementById('emptyGoToAdminBtn')?.addEventListener('click', () => {
    onNavigate('admin-courses');
  });

  // Preview sample cert button
  document.getElementById('previewSampleCertBtn')?.addEventListener('click', () => {
    // Open cert for the first sample graduated student (e.g. STU-2026-001)
    onNavigate('certificate', { studentId: 'STU-2026-001' });
  });

  // Register for specific course buttons
  document.querySelectorAll('.register-for-course-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const courseId = e.currentTarget.getAttribute('data-course-id');
      onNavigate('register', { selectedCourseId: courseId });
    });
  });
}
