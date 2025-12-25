import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

const XReportButton: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const generatePDF = async () => {
    const element = document.getElementById('rapport-x-content');
    if (!element) return;

    // Capture parfaite du contenu (fond violet + bordures)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: null, // garde le fond transparent → jsPDF le gérera
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calcule la hauteur pour garder le ratio
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Si trop grand → ajoute des pages
    let heightLeft = imgHeight;
    let position = 0;

    // Première page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Pages suivantes si nécessaire
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Nom du fichier avec date tunisienne
    const today = new Date().toLocaleDateString('fr-TN').replace(/\//g, '-');
    pdf.save(`Rapport_X_${today}-${new Date().getTime()}.pdf`);
  };

  return (
    <button
      disabled={disabled}
      onClick={generatePDF}
      className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
        disabled 
          ? 'bg-gray-500 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-700 active:scale-95'
      }`}
    >
      {disabled ? '⏳ Chargement...' : '📄 Télécharger PDF'}
    </button>
  );
};

export default XReportButton;