<?php

namespace App\Mail;

use App\Models\ContactFormSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormCustomerMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ContactFormSubmission $submission
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We received your message – Travel Insolite',
            to: [$this->submission->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-customer'
        );
    }
}
