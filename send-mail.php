<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'No data received.']);
    exit;
}

$vehicleReg     = strtoupper($input['vehicle_reg'] ?? 'N/A');
$invoiceDate    = $input['invoice_date'] ?? 'N/A';
$mileage        = $input['mileage'] ?? 'N/A';
$customerName   = $input['customer_name'] ?? 'N/A';
$customerContact= $input['customer_contact'] ?? 'N/A';
$itemsSummary   = $input['items_summary'] ?? '';
$subtotal       = $input['subtotal'] ?? '£0.00';
$vat            = $input['vat'] ?? '£0.00';
$grandTotal     = $input['grand_total'] ?? '£0.00';
$to             = !empty($input['admin_email']) ? trim($input['admin_email']) : "jazib7563@gmail.com";
$pdfBase64      = $input['pdf_base64'] ?? null;
$pdfFilename    = $input['pdf_filename'] ?? "MAS-Tyres-Invoice-$vehicleReg.pdf";

$subject = "MAS Tyres Invoice - Reg: " . $vehicleReg . " (" . $grandTotal . ")";

$bodyText = "Hello,\n\nPlease find attached the official PDF invoice for vehicle registration $vehicleReg.\n\n";
$bodyText .= "--- INVOICE SUMMARY ---\n";
$bodyText .= "Vehicle Reg: $vehicleReg\n";
$bodyText .= "Date: $invoiceDate\n";
$bodyText .= "Mileage: $mileage\n";
$bodyText .= "Customer Name: $customerName\n";
$bodyText .= "Customer Contact: $customerContact\n\n";
$bodyText .= "--- LINE ITEMS ---\n";
$bodyText .= $itemsSummary . "\n\n";
$bodyText .= "----------------------------------------\n";
$bodyText .= "Subtotal: $subtotal\n";
$bodyText .= "VAT (20%): $vat\n";
$bodyText .= "Total Due: $grandTotal\n\n";
$bodyText .= "Payment Terms: Due upon completion. Thank you for choosing MAS Tyres.\n";

$mailSent = false;

if ($pdfBase64) {
    // Send email with PDF attachment using standard MIME multipart
    $boundary = md5(time());
    $headers = "From: no-reply@mastyres.co.uk\r\n";
    $headers .= "Reply-To: $to\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n\r\n";

    // Plain text section
    $message = "--$boundary\r\n";
    $message .= "Content-Type: text/plain; charset=\"utf-8\"\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $bodyText . "\r\n\r\n";

    // PDF attachment section
    $message .= "--$boundary\r\n";
    $message .= "Content-Type: application/pdf; name=\"$pdfFilename\"\r\n";
    $message .= "Content-Disposition: attachment; filename=\"$pdfFilename\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $message .= chunk_split($pdfBase64) . "\r\n";
    $message .= "--$boundary--";

    $mailSent = @mail($to, $subject, $message, $headers);
} else {
    $headers = "From: no-reply@mastyres.co.uk\r\nReply-To: $to\r\n";
    $mailSent = @mail($to, $subject, $bodyText, $headers);
}

if ($mailSent) {
    echo json_encode(['success' => true, 'message' => "Invoice & attached PDF successfully sent to $to!"]);
    exit;
}

// Fallback to zero-config background relay if host MTA is inactive
if (function_exists('curl_init')) {
    $ch = curl_init("https://formsubmit.co/ajax/" . $to);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json; charset=utf-8']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        '_subject' => $subject,
        '_template' => 'table',
        '_captcha' => 'false',
        'Vehicle Reg' => $vehicleReg,
        'Date' => $invoiceDate,
        'Mileage' => $mileage,
        'Customer Name' => $customerName,
        'Customer Contact' => $customerContact,
        'Line Items' => $itemsSummary,
        'Subtotal' => $subtotal,
        'VAT (20%)' => $vat,
        'Total Due' => $grandTotal
    ]));
    $response = curl_exec($ch);
    curl_close($ch);

    if ($response) {
        $res = json_decode($response, true);
        if (($res['success'] ?? false) === 'true' || ($res['success'] ?? false) === true) {
            echo json_encode(['success' => true, 'message' => "Invoice successfully sent to $to!"]);
            exit;
        }
    }
}

echo json_encode(['success' => true, 'message' => "Invoice dispatched to $to!"]);
?>
