
// /**
//  * Represents a notification.
//  */
// export interface Notification {
//   /**
//    * The recipient of the notification.
//    */
//   recipient: string;
//   /**
//    * The subject of the notification.
//    */
//   subject: string;
//   /**
//    * The body of the notification.
//    */
//   body: string;
// }

// /**
//  * Asynchronously sends a notification.
//  *
//  * @param notification The notification to send.
//  * @returns A promise that resolves when the notification has been sent.
//  */
// export async function sendNotification(notification: Notification): Promise<void> {
//   // TODO: Implement this by calling an API or using a push notification service.
//   console.log(`(RN) Sending Notification: To=${notification.recipient}, Subject=${notification.subject}`);
//   await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
//   return;
// }


// services/notification.ts
import { Client, Functions, Account } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68482013000712591aa2');

const functions = new Functions(client);
const account = new Account(client);

export interface Notification {
  recipient: string;
  subject: string;
  body: string;
  meetingId?: string;
  meetingDetails?: {
    title: string;
    date: string;
    time: string;
    location: string;
  };
}

export async function sendNotification(notification: Notification): Promise<void> {
  try {
    // Execute Appwrite Function to send email
    const response = await functions.createExecution(
      'YOUR_FUNCTION_ID', // Replace with your function ID
      JSON.stringify({
        recipient: notification.recipient,
        subject: notification.subject,
        body: notification.body,
        meetingDetails: notification.meetingDetails
      })
    );

    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}

// // In your Appwrite Function
// import { email } from 'appwrite';

// export default async ({ req, res, log, error }) => {
//   try {
//     const { recipient, subject, body, meetingDetails } = JSON.parse(req.payload);

//     // Create email content
//     const htmlBody = `
//       <h1>Meeting Invitation: ${meetingDetails?.title || 'New Meeting'}</h1>
//       <p>${body}</p>
//       <h3>Meeting Details:</h3>
//       <ul>
//         <li>Date: ${meetingDetails?.date}</li>
//         <li>Time: ${meetingDetails?.time}</li>
//         <li>Location: ${meetingDetails?.location}</li>
//       </ul>
//       <p>Please respond to this invitation.</p>
//     `;

//     // Send email
//     await email.send(
//       recipient,
//       subject,
//       htmlBody,
//       'noreply@yourdomain.com', // Your verified sender email
//       'Your Organization Name'
//     );

//     return res.json({ success: true });
//   } catch (err) {
//     error(err.message);
//     return res.json({ success: false, error: err.message }, 500);
//   }
// };




// Add this to your services/notification.ts or create a new service file
import { storage } from '@/lib/appwrite';

export async function downloadDocument(fileId: string): Promise<string> {
  try {
    const response = await storage.getFileDownload('685f599b0034c8890ccd', fileId);
    return response.href; // Returns the download URL
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}