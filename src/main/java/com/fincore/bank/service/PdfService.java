package com.fincore.bank.service;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.fincore.bank.entity.Transaction;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfService {
    public byte[] generateStatement(Long accNo, List<Transaction> txList) throws Exception {
        Document doc = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(doc, out);
        doc.open();
        Font title = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        doc.add(new Paragraph("Account Statement", title));
        doc.add(new Paragraph("Account: " + accNo));
        doc.add(new Paragraph("\n"));
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell("Date"); table.addCell("Type"); table.addCell("Amount"); table.addCell("Description");
        for (Transaction t : txList) {
            table.addCell(String.valueOf(t.getTxTime()));
            table.addCell(t.getTxType());
            table.addCell(String.valueOf(t.getAmount()));
            table.addCell(t.getDescription());
        }
        doc.add(table);
        doc.close();
        return out.toByteArray();
    }
}
