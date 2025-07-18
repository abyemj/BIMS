

import { Client, Account, Databases, Storage, Query } from 'appwrite';

export const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68482013000712591aa2');

export const account = new Account(client);
export const databases = new Databases(client); 
export const storage = new Storage(client);
export { Query }; 