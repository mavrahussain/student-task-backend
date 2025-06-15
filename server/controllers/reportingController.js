const Student = require('../models/Student');
const Task = require('../models/Task');
const PDFDocument = require('pdfkit');

const generatePdfReport = async (req, res) => {
  try {
    // Get all students with their tasks and submissions
    const students = await Student.find()
      .populate({
        path: 'tasks',
        populate: {
          path: 'submissions',
          match: { student: req.user.id }
        }
      });

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=student_report_${Date.now()}.pdf`);

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(25).text('Student Performance Report', { align: 'center' });
    doc.moveDown();

    for (const student of students) {
      doc.fontSize(16).text(`Student: ${student.name}`);
      doc.fontSize(12).text(`Student ID: ${student.studentId}`);
      doc.fontSize(12).text(`Category: ${student.category || 'Not Assigned'}`);
      doc.moveDown();

      // Add task performance
      doc.fontSize(14).text('Task Performance:');
      for (const task of student.tasks) {
        const submission = task.submissions[0];
        doc.fontSize(12).text(`Task: ${task.title}`);
        doc.fontSize(10).text(`Status: ${submission ? submission.status : 'Not Submitted'}`);
        if (submission && submission.feedback) {
          doc.fontSize(10).text(`Feedback: ${submission.feedback}`);
        }
        doc.moveDown();
      }
      doc.addPage();
    }

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF report:', error);
    // If headers are already sent, we can't send a JSON response
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF report', error: error.message });
    }
  }
};

const generateCertificate = async (req, res) => {
  try {
    const { studentId } = req.body;
    
    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create a new PDF document for certificate
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4'
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate_${studentId}_${Date.now()}.pdf`);

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add certificate content
    doc.fontSize(40).text('Certificate of Achievement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(25).text('This is to certify that', { align: 'center' });
    doc.moveDown();
    doc.fontSize(30).text(student.name, { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text('has successfully completed all assigned tasks', { align: 'center' });
    doc.moveDown();
    doc.fontSize(15).text(`Student ID: ${student.studentId}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(15).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Failed to generate certificate', error: error.message });
  }
};

const publishTopPerformers = async (req, res) => {
  try {
    // Get all students with their task submissions
    const students = await Student.find()
      .populate({
        path: 'tasks',
        populate: {
          path: 'submissions',
          match: { student: req.user.id }
        }
      });

    // Calculate performance score for each student
    const studentPerformance = students.map(student => {
      const completedTasks = student.tasks.filter(task => 
        task.submissions[0] && task.submissions[0].status === 'approved'
      ).length;
      
      const totalTasks = student.tasks.length;
      const performanceScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        studentId: student.studentId,
        name: student.name,
        category: student.category,
        completedTasks,
        totalTasks,
        performanceScore
      };
    });

    // Sort by performance score and get top 10
    const topPerformers = studentPerformance
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10);

    res.status(200).json({ 
      message: 'Top performers published successfully!',
      topPerformers
    });
  } catch (error) {
    console.error('Error publishing top performers:', error);
    res.status(500).json({ message: 'Failed to publish top performers', error: error.message });
  }
};

module.exports = {
  generatePdfReport,
  generateCertificate,
  publishTopPerformers,
}; 