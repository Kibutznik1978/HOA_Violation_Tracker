import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { Violation, HOA } from '../types';

const functions = getFunctions();

export interface EmailNotificationData {
  violation: Violation;
  hoa: HOA;
}

export interface ResidentEmailData {
  violation: Violation;
  recipientEmail: string;
  subject: string;
  message: string;
}

export const sendViolationNotification = async (data: EmailNotificationData) => {
  try {
    const sendNotification = httpsCallable(functions, 'sendViolationNotification');
    const result = await sendNotification(data);
    return result.data;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

export const sendViolationNotificationToResident = async (data: ResidentEmailData) => {
  try {
    const sendResidentNotification = httpsCallable(functions, 'sendResidentNotification');
    const result = await sendResidentNotification(data);
    return result.data;
  } catch (error) {
    console.error('Error sending resident email:', error);
    throw error;
  }
};