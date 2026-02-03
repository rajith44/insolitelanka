<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h2 { color: #1a1a1a; }
        .field { margin-bottom: 12px; }
        .label { font-weight: bold; }
        .message { white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 6px; margin-top: 8px; }
    </style>
</head>
<body>
    <h2>New contact form submission</h2>
    <div class="field"><span class="label">Name:</span> {{ $submission->name }}</div>
    <div class="field"><span class="label">Email:</span> <a href="mailto:{{ $submission->email }}">{{ $submission->email }}</a></div>
    @if($submission->phone)
    <div class="field"><span class="label">Phone / WhatsApp:</span> {{ $submission->phone }}</div>
    @endif
    <div class="field"><span class="label">Message:</span></div>
    <div class="message">{{ $submission->message }}</div>
    <p style="margin-top: 24px; font-size: 12px; color: #666;">You can reply directly to this email to respond to {{ $submission->name }}.</p>
</body>
</html>
