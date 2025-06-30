
// import { Client, Account, Databases, Users as AppwriteUsers } from 'react-native-appwrite';

// // IMPORTANT: Replace with your actual Appwrite project configuration
// const APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1"; 
// const APPWRITE_PROJECT_ID = "67e12e7d0017fe109cb2";

// if (APPWRITE_ENDPOINT === "https://cloud.appwrite.io/v1" || !APPWRITE_ENDPOINT) {
//   console.warn(
//     'Appwrite endpoint is not configured. Please set it in react-native-prototype/src/lib/appwrite.ts'
//   );
// }

// if (APPWRITE_PROJECT_ID === "67e12e7d0017fe109cb2" || !APPWRITE_PROJECT_ID) {
//   console.warn(
//     'Appwrite project ID is not configured. Please set it in react-native-prototype/src/lib/appwrite.ts'
//   );
// }

// const client = new Client();

// client
//     .setEndpoint("https://cloud.appwrite.io/v1")
//     .setProject("67e12e7d0017fe109cb2");

// export const account = new Account(client);
// export const databases = new Databases(client);
// export const appwriteUsers = new AppwriteUsers(client); // Service for user management

// // Define your Appwrite Collection IDs here (replace with your actual IDs if needed)
// // These are examples, you'll need to create these in your Appwrite console.
// export const MEETINGS_COLLECTION_ID = 'meetings';
// export const DOCUMENTS_COLLECTION_ID = 'documents';
// // For user profiles, if not using prefs extensively, you might have a 'profiles' collection
// export const PROFILES_COLLECTION_ID = 'profiles';

// export default client;


// 'use client';

// // Attempt to import Appwrite assuming it might be a class for older SDK versions
// // We will try both default and named import for 'Appwrite' class.
// import { Client as ModernClient, Account as ModernAccount, Databases as ModernDatabases } from 'react-native-appwrite';
// // Note: 'Users as ModernUsers' is intentionally omitted due to previous "Export Users doesn't exist" error.
// // This will cause 'ModernUsers' to be undefined, and usersService will use the dummy fallback.

// const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
// const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '68482013000712591aa2'

// if (!APPWRITE_ENDPOINT || APPWRITE_ENDPOINT === 'YOUR_APPWRITE_ENDPOINT') {
//   console.warn(
//     'Appwrite endpoint is not configured. Please set NEXT_PUBLIC_APPWRITE_ENDPOINT in your .env.local file.'
//   );
// }

// if (!APPWRITE_PROJECT_ID || APPWRITE_PROJECT_ID === 'YOUR_APPWRITE_PROJECT_ID') {
//   console.warn(
//     'Appwrite project ID is not configured. Please set NEXT_PUBLIC_APPWRITE_PROJECT_ID in your .env.local file.'
//   );
// }

// let accountService: any;
// let databasesService: any;
// let usersService: any;
// let appwriteMainInstance: any; // To hold either the new Client instance or the old sdk

// try {
//     // Prioritize modern SDK structure (Appwrite v11+)
//     const client = new ModernClient();
//     client
//         .setEndpoint(APPWRITE_ENDPOINT)
//         .setProject(APPWRITE_PROJECT_ID);
    
//     accountService = new ModernAccount(client);
//     databasesService = new ModernDatabases(client);
    
//     // @ts-ignore (ModernUsers will be undefined if not imported)
//     if (typeof ModernUsers !== 'undefined') {
//         // @ts-ignore
//         usersService = new ModernUsers(client);
//     } else {
//         // This error is thrown if ModernUsers is not available from import,
//         // leading to the catch block for usersService fallback (which is now simplified).
//         throw new Error("'Users' service not available through modern named import. usersService will use dummy.");
//     }
    
//     appwriteMainInstance = client;
//     console.log("Initialized Appwrite SDK using modern pattern for Account and Databases.");

// } catch (e: any) {
//     console.warn("Modern Appwrite SDK initialization failed for one or more services. Error: ", e.message);
//     // The fallback logic that relied on 'AppwriteDefault' is removed
//     // as 'AppwriteDefault' is not a valid import from the current SDK.
//     // Services not initialized in the try block will rely on the final dummy fallbacks.
// }

// // If services are still not initialized, provide dummy fallbacks to prevent app crash
// if (!accountService) {
//     console.error("Appwrite Account service failed to initialize!");
//     accountService = { 
//         get: async () => { throw new Error("Appwrite Account service not initialized"); },
//         createEmailPasswordSession: async () => { throw new Error("Appwrite Account service not initialized"); },
//         deleteSession: async () => { throw new Error("Appwrite Account service not initialized"); },
//         updateName: async () => { throw new Error("Appwrite Account service not initialized"); },
//         updatePrefs: async () => { throw new Error("Appwrite Account service not initialized"); },
//         updateEmail: async () => { throw new Error("Appwrite Account service not initialized"); },
//         updatePassword: async () => { throw new Error("Appwrite Account service not initialized"); },
//     };
// }
// if (!databasesService) {
//     console.error("Appwrite Databases service failed to initialize!");
//     databasesService = { 
//         listDocuments: async () => { throw new Error("Appwrite Databases service not initialized"); } 
//         // Add other methods used by your app as dummies if needed
//     };
// }
// if (!usersService) {
//     console.error("Appwrite Users service critically failed to initialize or was not available via import! Using dummy implementation.");
//     usersService = { 
//         list: async () => { console.error("Dummy Appwrite Users.list called."); return { users: [], total: 0 }; },
//         create: async () => { throw new Error("Dummy Appwrite Users.create called."); },
//         updatePrefs: async () => { throw new Error("Dummy Appwrite Users.updatePrefs called."); }
//         // Add other methods used by your app as dummies
//     };
// }

// export const account = accountService;
// export const databases = databasesService;
// export const appwriteUsers = usersService;

// // Define your Appwrite Collection IDs here
// export const MEETINGS_COLLECTION_ID = 'meetings';
// export const DOCUMENTS_COLLECTION_ID = 'documents';
// export const PROFILES_COLLECTION_ID = 'profiles';

// export default appwriteMainInstance;









// import { Client, Account } from 'appwrite';

// export const client = new Client();
// client
//   .setEndpoint('https://fra.cloud.appwrite.io/v1') 
//   .setProject('68482013000712591aa2')
// //   .setSelfSigned(true); // Required for custom domains

// export const account = new Account(client);


// import { Client, Account, Databases,Storage } from 'appwrite';

// export const client = new Client()
//   .setEndpoint('https://fra.cloud.appwrite.io/v1')
//   .setProject('68482013000712591aa2');

// export const account = new Account(client);
// export const databases = new Databases(client); 
// export const storage = new Storage(client); 

import { Client, Account, Databases, Storage, } from 'appwrite';

export const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68482013000712591aa2');

export const account = new Account(client);
export const databases = new Databases(client); 
export const storage = new Storage(client);

// Add this line to export the InputFile helper class
// export { InputFile }; 