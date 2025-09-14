import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function downloadRegistrationPDF(registrationData: {
  uniqueId: string;
  childName: string;
  dateOfBirth: string;
  contactNumber: string;
}) {
  const { uniqueId, childName, dateOfBirth, contactNumber } = registrationData;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(20, 30, pageWidth - 40, 200, 6, 6, "F");

  pdf.setDrawColor(34, 197, 94);
  pdf.setLineWidth(2);
  pdf.circle(pageWidth / 2, 50, 10);
  pdf.setFontSize(20);
  pdf.setTextColor(34, 197, 94);
  pdf.text("✔", pageWidth / 2 - 4, 57);

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Registration Successful 🎉", pageWidth / 2, 80, {
    align: "center",
  });

  pdf.setFontSize(12);
  pdf.setTextColor(80, 80, 80);
  pdf.text("Your Registration ID is:", pageWidth / 2, 95, { align: "center" });

  pdf.setFontSize(20);
  pdf.setTextColor(30, 64, 175);
  pdf.text(uniqueId, pageWidth / 2, 110, { align: "center" });

  const qrData = JSON.stringify({
    uniqueId,
    childName,
    dateOfBirth,
    contactNumber,
  });
  const qrUrl = await QRCode.toDataURL(qrData, { width: 150 });
  pdf.addImage(qrUrl, "PNG", pageWidth / 2 - 30, 120, 60, 60);

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    "This ID has been downloaded on your device. Please show it to a volunteer for final verification.",
    pageWidth / 2,
    190,
    { align: "center", maxWidth: pageWidth - 60 }
  );

  pdf.save(`registration_${uniqueId}.pdf`);
}
