import { google } from 'googleapis';
import { verifyGoogleCalendarAccess } from "./verify";
import { getUserUid } from "../../ai";

export const updateGoogleCalendarEvent = async (params: {
    eventId: string;
    summary?: string;
    description?: string; 
    startDateTime?: string;
    endDateTime?: string;
}) => {
    const uid = getUserUid();
    // Verify access and get credentials
    const { exists, credentials } = await verifyGoogleCalendarAccess(uid);
    if (!exists) throw new Error('Google Calendar not connected');

    // Initialize OAuth2 client
    const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oAuth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expiry_date: credentials.expiry_date
    });

    // Check if token needs refresh
    const isTokenExpired = credentials.expiry_date <= Date.now();
    if (isTokenExpired) {
        try {
            const { credentials: newCredentials } = await oAuth2Client.refreshAccessToken();
            credentials.access_token = newCredentials.access_token;
            credentials.expiry_date = newCredentials.expiry_date;
        } catch (error) {
            console.error('Error refreshing access token:', error);
            throw new Error('Failed to refresh Google Calendar access');
        }
    }

    // Initialize calendar service
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    try {
        // First, get the existing event to preserve fields that aren't being updated
         await calendar.events.get({
            calendarId: 'primary',
            eventId: params.eventId,
        });

        // Build the update object with only provided fields
        const eventUpdate: any = {};
        
        if (params.summary !== undefined) {
            eventUpdate.summary = params.summary;
        }
        
        if (params.description !== undefined) {
            eventUpdate.description = params.description;
        }
        
        if (params.startDateTime !== undefined) {
            eventUpdate.start = {
                dateTime: new Date(params.startDateTime).toISOString().replace(/\.000Z/i, ''),
                timeZone: 'Africa/Lagos'
            };
        }
        
        if (params.endDateTime !== undefined) {
            eventUpdate.end = {
                dateTime: new Date(params.endDateTime).toISOString().replace(/\.000Z/i, ''),
                timeZone: 'Africa/Lagos'
            };
        }

    
        const response = await calendar.events.patch({
            calendarId: 'primary',
            eventId: params.eventId,
            requestBody: eventUpdate,
        });

        return response.data;
    } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        throw new Error('Failed to update calendar event');
    }
}; 