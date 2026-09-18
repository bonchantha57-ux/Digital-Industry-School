import html2canvas from 'html2canvas';

/**
 * Download an HTML element as high-resolution PNG image
 */
export async function downloadCertificateAsImage(elementId, filename = 'Khmer_Certificate.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  try {
    // High scale (2x or 3x) for crisp certificate printing quality
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to export certificate image:', error);
    alert('មានបញ្ហាក្នុងការទាញយករូបភាព សូមសាកល្បងម្ដងទៀត ឬប្រើមុខងារបោះពុម្ព (Print)');
    return false;
  }
}

/**
 * Trigger print dialog with landscape mode optimized
 */
export function printCertificate() {
  window.print();
}
