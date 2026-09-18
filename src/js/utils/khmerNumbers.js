/**
 * Khmer Number & Date Utility Helpers
 */

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];
const KHMER_DAYS = [
  'អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'
];

/**
 * Converts standard numbers to Khmer numerals (e.g. 2026 -> ២០២៦)
 */
export function toKhmerNum(num) {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, digit => KHMER_DIGITS[parseInt(digit, 10)]);
}

/**
 * Formats a Date object or ISO string to standard Khmer formal date with customizable location
 * e.g., "រាជធានីភ្នំពេញ, ថ្ងៃទី១៨ ខែកញ្ញា ឆ្នាំ២០២៦"
 */
export function formatKhmerDate(dateInput, location = 'រាជធានីភ្នំពេញ') {
  let day, monthIdx, year;

  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const parts = dateInput.split('T')[0].split('-');
    year = parseInt(parts[0], 10);
    monthIdx = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else {
    const date = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(date.getTime())) return '';
    day = date.getDate();
    monthIdx = date.getMonth();
    year = date.getFullYear();
  }

  const khDay = toKhmerNum(day);
  const khMonth = KHMER_MONTHS[monthIdx] || 'កញ្ញា';
  const khYear = toKhmerNum(year);
  const loc = (location || 'រាជធានីភ្នំពេញ').trim();

  return `${loc}, ថ្ងៃទី${khDay} ខែ${khMonth} ឆ្នាំ${khYear}`;
}

/**
 * Converts English grade to formal Khmer distinction
 */
export function getGradeDetails(score) {
  const numScore = parseFloat(score) || 0;
  if (numScore >= 85) {
    return {
      grade: 'A',
      titleKh: 'និទ្ទេស A (ល្អប្រសើរ)',
      titleEn: 'Distinction (Grade A)',
      gpa: '4.0',
      status: 'Passed',
      statusKh: 'ជាប់កម្រិតល្អប្រសើរ',
      color: '#10B981'
    };
  } else if (numScore >= 75) {
    return {
      grade: 'B',
      titleKh: 'និទ្ទេស B (ល្អណាស់)',
      titleEn: 'Very Good (Grade B)',
      gpa: '3.0',
      status: 'Passed',
      statusKh: 'ជាប់កម្រិតល្អណាស់',
      color: '#3B82F6'
    };
  } else if (numScore >= 65) {
    return {
      grade: 'C',
      titleKh: 'និទ្ទេស C (ល្អ)',
      titleEn: 'Good (Grade C)',
      gpa: '2.5',
      status: 'Passed',
      statusKh: 'ជាប់កម្រិតល្អ',
      color: '#F59E0B'
    };
  } else if (numScore >= 50) {
    return {
      grade: 'D',
      titleKh: 'និទ្ទេស D (មធ្យម)',
      titleEn: 'Satisfactory (Grade D)',
      gpa: '2.0',
      status: 'Passed',
      statusKh: 'ជាប់កម្រិតមធ្យម',
      color: '#EAB308'
    };
  } else {
    return {
      grade: 'F',
      titleKh: 'និទ្ទេស F (ធ្លាក់)',
      titleEn: 'Fail (Grade F)',
      gpa: '0.0',
      status: 'Failed',
      statusKh: 'មិនទាន់ជាប់',
      color: '#EF4444'
    };
  }
}
