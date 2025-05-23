import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { goals_db_string } from '../init'
import { notifyUser } from '../helpers/emailNotifier'
import { welcomeNewGoalmaticUserMsg } from './onCreatedMail'


export const welcomeNewGoalmaticUser = onDocumentCreated({
  document: 'users/{userId}',
  database: goals_db_string,
}, async (event) => {
  // Get the new user data
  const userData = event.data?.data()
  
  if (!userData) {
    return null
  }

  // Check if the user has an email
  if (!userData.email) {
    return null
  }

  // Prepare the welcome email message
  const welcomeMessage = welcomeNewGoalmaticUserMsg({
    email: userData.email,
    name: userData.name || 'New User'
  })
  
  // Ensure showLogs is set to false by default if not present
  if (userData.showLogs === undefined) {
    const userRef = event.data?.ref;
    if (userRef) {
      await userRef.update({ showLogs: false });
    }
  }

  try {
    // Send the welcome email
    const result = await notifyUser(welcomeMessage)
    return result
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return null
  }
})
