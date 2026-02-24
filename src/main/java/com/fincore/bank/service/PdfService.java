package com.fincore.bank.service;
import com.fincore.bank.entity.Account;
import com.fincore.bank.entity.Customer;
import com.fincore.bank.entity.FixedDeposit;
import com.fincore.bank.entity.LoanAccount;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.fincore.bank.entity.Transaction;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfService {
    public byte[] generateStatement(Long accNo, List<Transaction> txList) throws Exception {
        Document doc = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(doc, out);
        doc.open();
        addHeader(doc, "Account Statement");
        doc.add(new Paragraph("Account Number: " + accNo, bodyFont(11, Font.BOLD)));
        doc.add(new Paragraph(" "));
        PdfPTable table = new PdfPTable(new float[]{2.4f, 1.7f, 1.3f, 3.6f});
        table.setWidthPercentage(100);
        addTableHeader(table, "Date");
        addTableHeader(table, "Type");
        addTableHeader(table, "Amount");
        addTableHeader(table, "Description");
        for (Transaction t : txList) {
            addCell(table, String.valueOf(t.getTxTime()));
            addCell(table, t.getTxType());
            addCell(table, String.format("INR %.2f", t.getAmount()));
            addCell(table, t.getDescription());
        }
        doc.add(table);
        addFooter(doc);
        doc.close();
        return out.toByteArray();
    }

    public byte[] generateFixedDepositReceipt(FixedDeposit fd, Account account, Customer customer) throws Exception {
        Document doc = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(doc, out);
        doc.open();
        addHeader(doc, "Fixed Deposit Advice");
        addCustomerBlock(doc, account.getAccountNumber(), customer);

        PdfPTable table = new PdfPTable(new float[]{2.2f, 3.8f});
        table.setWidthPercentage(100);
        addLabelValue(table, "FD ID", String.valueOf(fd.getId()));
        addLabelValue(table, "Status", String.valueOf(fd.getStatus()));
        addLabelValue(table, "Principal", String.format("INR %.2f", fd.getPrincipalAmount()));
        addLabelValue(table, "Interest Rate", String.format("%.2f%% p.a.", fd.getInterestRate()));
        addLabelValue(table, "Tenure", fd.getTenureMonths() + " months");
        addLabelValue(table, "Maturity Amount", String.format("INR %.2f", fd.getMaturityAmount()));
        addLabelValue(table, "Start Date", String.valueOf(fd.getCreatedAt()));
        addLabelValue(table, "Maturity Date", fd.getMaturityDate() == null ? "-" : fd.getMaturityDate().format(DateTimeFormatter.ISO_DATE));
        doc.add(table);
        doc.add(new Paragraph(" "));
        doc.add(new Paragraph("This is a computer-generated FD advice. No signature required.", bodyFont(9, Font.ITALIC)));
        addFooter(doc);
        doc.close();
        return out.toByteArray();
    }

    public byte[] generateLoanSummary(LoanAccount loan, Account account, Customer customer) throws Exception {
        Document doc = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(doc, out);
        doc.open();
        addHeader(doc, "Loan Account Summary");
        addCustomerBlock(doc, account.getAccountNumber(), customer);

        PdfPTable table = new PdfPTable(new float[]{2.2f, 3.8f});
        table.setWidthPercentage(100);
        addLabelValue(table, "Loan ID", String.valueOf(loan.getId()));
        addLabelValue(table, "Type", loan.getLoanType());
        addLabelValue(table, "Status", String.valueOf(loan.getStatus()));
        addLabelValue(table, "Principal", String.format("INR %.2f", loan.getPrincipalAmount()));
        addLabelValue(table, "Interest Rate", String.format("%.2f%% p.a.", loan.getInterestRate()));
        addLabelValue(table, "Tenure", loan.getTenureMonths() + " months");
        addLabelValue(table, "EMI", String.format("INR %.2f", loan.getEmiAmount()));
        addLabelValue(table, "Outstanding", String.format("INR %.2f", loan.getOutstandingAmount()));
        addLabelValue(table, "Total Repaid", String.format("INR %.2f", loan.getTotalRepaid()));
        addLabelValue(table, "Approved By", loan.getApprovedBy() == null ? "-" : loan.getApprovedBy());
        addLabelValue(table, "Approved At", loan.getApprovedAt() == null ? "-" : String.valueOf(loan.getApprovedAt()));
        addLabelValue(table, "Last Payment At", loan.getLastPaymentAt() == null ? "-" : String.valueOf(loan.getLastPaymentAt()));
        doc.add(table);
        doc.add(new Paragraph(" "));
        doc.add(new Paragraph("This is a computer-generated loan summary. No signature required.", bodyFont(9, Font.ITALIC)));
        addFooter(doc);
        doc.close();
        return out.toByteArray();
    }

    private void addHeader(Document doc, String titleText) throws DocumentException {
        Paragraph logo = new Paragraph("FINCORE BANK", bodyFont(18, Font.BOLD));
        logo.setAlignment(Element.ALIGN_CENTER);
        doc.add(logo);
        Paragraph subtitle = new Paragraph("Trusted Digital Banking", bodyFont(10, Font.NORMAL));
        subtitle.setAlignment(Element.ALIGN_CENTER);
        doc.add(subtitle);
        Paragraph title = new Paragraph(titleText, bodyFont(14, Font.BOLD));
        title.setSpacingBefore(10);
        title.setSpacingAfter(10);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
    }

    private void addFooter(Document doc) throws DocumentException {
        Paragraph footer = new Paragraph(
                "Fincore Bank | Main Branch | IFSC FINC0001 | support@fincorebank.com",
                bodyFont(8, Font.NORMAL)
        );
        footer.setSpacingBefore(14);
        footer.setAlignment(Element.ALIGN_CENTER);
        doc.add(footer);
    }

    private void addCustomerBlock(Document doc, Long accountNumber, Customer customer) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{2.2f, 3.8f});
        table.setWidthPercentage(100);
        addLabelValue(table, "Account Number", String.valueOf(accountNumber));
        addLabelValue(table, "Customer Name", customer == null ? "-" : customer.getName());
        addLabelValue(table, "Email", customer == null ? "-" : customer.getEmail());
        addLabelValue(table, "Phone", customer == null ? "-" : customer.getPhone());
        addLabelValue(table, "Address", customer == null ? "-" : customer.getAddress());
        doc.add(table);
        doc.add(new Paragraph("\n"));
    }

    private void addLabelValue(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, bodyFont(10, Font.BOLD)));
        labelCell.setBackgroundColor(new BaseColor(238, 242, 255));
        labelCell.setPadding(8);
        PdfPCell valueCell = new PdfPCell(new Phrase(value == null ? "-" : value, bodyFont(10, Font.NORMAL)));
        valueCell.setPadding(8);
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, bodyFont(10, Font.BOLD)));
        cell.setBackgroundColor(new BaseColor(226, 232, 240));
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text == null ? "-" : text, bodyFont(9, Font.NORMAL)));
        cell.setPadding(7);
        table.addCell(cell);
    }

    private Font bodyFont(int size, int style) {
        return new Font(Font.FontFamily.HELVETICA, size, style);
    }
}
