from jinja2 import Environment, FileSystemLoader
#from weasyprint import HTML
from io import BytesIO
from datetime import datetime
import os
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import base64
import logging

# Setup logging
mail_logger = logging.getLogger("app.mail")

load_dotenv()
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN")
SENDER_EMAIL = os.getenv("GMAIL_SENDER")


def generate_pdf_in_memory(artist_name: str, booking_details: dict, chat_url: str) -> BytesIO:
    mail_logger.debug("Generating PDF in memory" , extra={"artist_name": artist_name , "booking_details": booking_details , "chat_url": chat_url})
    # הגדרת תיקיית התבניות
    template_folder = os.path.join(os.path.dirname(__file__), "../assest")
    env = Environment(loader=FileSystemLoader(template_folder))
    template = env.get_template("template_booking_summary.html")

    # יצירת תאריך ושעה
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")

    # רינדור HTML מהתבנית
    html_content = template.render(
        artist_name=artist_name,
        booking_details=booking_details,
        chat_url=chat_url or "",
        date=date_str,
        time=time_str
    )

    # יצירת PDF בזיכרון (לשליחה במייל)
    pdf_io = BytesIO()
    HTML(string=html_content).write_pdf(pdf_io)
    pdf_io.seek(0)

    # שמירת הקובץ גם בדיסק באותה תיקייה
    # filename = f"booking_summary_{now.strftime('%Y%m%d_%H%M%S')}.pdf"
    # output_path = os.path.join(template_folder, filename)
    # HTML(string=html_content).write_pdf(output_path)
    mail_logger.debug("PDF generated successfully" , extra={"pdf_io": pdf_io})
    return pdf_io




def send_pdf_via_gmail(to_email: str, subject: str, body: str, pdf_content: bytes, pdf_filename: str) -> str:
    """
    שליחת PDF באמצעות Gmail API
    
    Args:
        to_email: כתובת מייל של הנמען
        subject: נושא המייל
        body: תוכן המייל
        pdf_content: תוכן הPDF כbytes
        pdf_filename: שם קובץ הPDF
        
    Returns:
        message_id: מזהה ההודעה שנשלחה
        
    Raises:
        Exception: אם השליחה נכשלה
    """
    try:
        mail_logger.debug("Sending email to: {to_email}" , extra={"to_email": to_email})
        
        # בדיקת משתנים נדרשים
        if not all([CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, SENDER_EMAIL]):
            raise ValueError("Missing required Gmail API credentials in environment variables")
        
        # יצירת credentials מ־.env
        creds = Credentials(
            None,
            refresh_token=REFRESH_TOKEN,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET
        )
        service = build('gmail', 'v1', credentials=creds)

        # בנה הודעת מייל עם קובץ מצורף
        message = MIMEMultipart()
        message['to'] = to_email
        message['from'] = SENDER_EMAIL
        message['subject'] = subject

        message.attach(MIMEText(body, 'plain'))

        # צרף את ה־PDF (מתוך זיכרון, בלי לכתוב לקובץ)
        pdf_attachment = MIMEApplication(pdf_content, _subtype="pdf")
        pdf_attachment.add_header('Content-Disposition', 'attachment', filename=pdf_filename)
        message.attach(pdf_attachment)

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        send_message = service.users().messages().send(
            userId="me",
            body={'raw': raw_message}
        ).execute()
        
        mail_logger.debug("Email sent successfully" , extra={"send_message": send_message})
        return send_message['id']
        
    except Exception as e:
        mail_logger.exception("Failed to send email", extra={"to_email": to_email})

        mail_logger.error("Failed to send email" , extra={"to_email": to_email , "error": e})
        raise

def send_booking_confirmation_email(
    artist_name: str, 
    booking_details: dict, 
    client_email: str,
    chat_url: str = None
) -> str:
    """
    שליחת מייל אישור הזמנה עם PDF מצורף
    
    Args:
        artist_name: שם האמן
        booking_details: פרטי ההזמנה (dict)
        client_email: כתובת מייל של הלקוח
        chat_url: קישור לצ'אט (אופציונלי)
        
    Returns:
        message_id: מזהה ההודעה שנשלחה
        
    Raises:
        Exception: אם יצירת הPDF או השליחה נכשלה
    """
    try:
        mail_logger.debug("Sending booking confirmation email" , extra={"artist_name": artist_name , "booking_details": booking_details , "client_email": client_email , "chat_url": chat_url})
        # יצירת PDF בזיכרון
        pdf_io = generate_pdf_in_memory(
            artist_name=artist_name,
            booking_details=booking_details,
            chat_url=chat_url or ""
        )
        
        # הכנת תוכן המייל
        subject = f"Booking Confirmation - {artist_name}"
        body = f"""
Dear Client,

Thank you for your booking request with {artist_name}.

Please find attached the booking summary with all the details of your request.

If you have any questions, please feel free to contact us.

Best regards,
ArtistryHub Team
"""
        
        # שליחת המייל עם PDF מצורף
        pdf_content = pdf_io.getvalue()
        filename = f"booking_summary_{artist_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        message_id = send_pdf_via_gmail(
            to_email=client_email,
            subject=subject,
            body=body,
            pdf_content=pdf_content,
            pdf_filename=filename
        )
        
        mail_logger.debug("Booking confirmation sent to {client_email}" , extra={"client_email": client_email})
        return message_id
        
    except Exception as e:
        mail_logger.exception("Failed to send booking confirmation", extra={"client_email": client_email   , "error": e})
        mail_logger.error("Failed to send booking confirmation" , extra={"client_email": client_email , "error": e})
        raise



