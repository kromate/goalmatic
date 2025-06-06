import { google } from 'googleapis';
import { verifyGoogleCalendarAccess } from "./verify";
import { getUserUid } from "../../index";
import { tool } from 'ai';
import { z } from 'zod';


const getGoogleCalendarEvents = async (queryParams?: {
    year: number;
}) => {
    const uid = getUserUid();
    // Verify access and get credentials
    const { exists, credentials } = await verifyGoogleCalendarAccess(uid)
    if (!exists) throw new Error('Google Calendar not connected')

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
            // Update credentials in the function scope
            credentials.access_token = newCredentials.access_token!;
            credentials.expiry_date = newCredentials.expiry_date!;
            
            // Note: You may want to update the credentials in your database here
        } catch (error) {
            throw new Error('Failed to refresh Google Calendar access');
        }
    }

    // Initialize calendar service
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Calculate year bounds from date
    const yearNumber = queryParams?.year || new Date().getFullYear();
    const yearStart = new Date(yearNumber, 0, 1); // January 1st
    const yearEnd = new Date(yearNumber, 11, 31, 23, 59, 59, 999); // December 31st 23:59:59.999


    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: yearStart.toISOString(),
            timeMax: yearEnd.toISOString(),
            maxResults: 2500,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items;
    } catch (error) {
        throw new Error('Failed to fetch calendar events');
    }
}

const getGoogleCalendarEventsTool = tool(
    {
        description: "fetches a user's Google Calendar events ",
        parameters: z.object({
            // year: z.number().optional().describe("Year for fetching events, must be in YYYY format"),
        }),
        // outputSchema: z.array(z.any()).describe("Array of calendar events"),
        execute:async (input) => {
        try {
            const events = await getGoogleCalendarEvents({
                year:  new Date().getFullYear()    
            });
            return events;
        } catch (error) {
            throw new Error('Failed to fetch calendar events');
        }
    }
    },
    
);

export const GOOGLECALENDAR_READ_EVENT = {
    id: "GOOGLECALENDAR_READ_EVENT",
    tool: getGoogleCalendarEventsTool,
}

