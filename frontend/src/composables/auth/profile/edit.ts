import { Timestamp } from 'firebase/firestore'
import { updateFirestoreDocument } from '@/firebase/firestore/edit'
import { useAlert } from '@/composables/core/notification'
import { useUser } from '@/composables/auth/user'
import { validate_data } from '@/composables/utils/formatter'

const isDisabled = ref(true)


const userProfileForm = {
	username: ref(''),
    name: ref(''),
    email: ref(''),
    phone: ref(''),
	bio: ref(''),
	photo_url: ref(''),
    referral_code: ref(''),
    showLogs: ref(false)
}

const populateData = () => {
    const { userProfile } = useUser()

    userProfileForm.username.value = userProfile.value!.username
    userProfileForm.name.value = userProfile.value!.name
    userProfileForm.photo_url.value = userProfile.value!.photo_url
    userProfileForm.bio.value = userProfile.value!.bio
    userProfileForm.email.value = userProfile.value!.email
    userProfileForm.phone.value = userProfile.value!.phone
    userProfileForm.referral_code.value = userProfile.value!.referral_code
    userProfileForm.showLogs.value = userProfile.value!.showLogs ?? false
}

export const useUpdateUserProfile = () => {
    const { id: user_id, isLoggedIn, userProfile, fetchUserProfile } = useUser()
    const loading = ref(false)
    const update = async () => {
        const sentData = {
            username: userProfileForm.username.value,
            name: userProfileForm.name.value,
            bio: userProfileForm.bio.value ?? null,
            photo_url: userProfileForm.photo_url.value ?? null,
            showLogs: userProfileForm.showLogs.value,
            updated_at: Timestamp.fromDate(new Date())
        } as any


        if (!validate_data(sentData, ['photo_url', 'bio', 'showLogs'])) return
        try {
            loading.value = true
            await updateFirestoreDocument('users', user_id.value!, sentData)
            userProfile.value = sentData
            loading.value = false
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Profile updated successfully' })
            fetchUserProfile(user_id.value!)
            isDisabled.value = true
        } catch (e: any) {
            loading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${e.message}` })
        }
    }

    const updatePhoto = async (url: string) => {
        try {
            loading.value = true
            await updateFirestoreDocument('users', user_id.value!, {
                photo_url: url ?? null
            })
            userProfileForm.photo_url.value = url

            loading.value = false
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Profile photo updated successfully' })
            fetchUserProfile(user_id.value!)
        } catch (e: any) {
            loading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${e.message}`, addrs: 'updatePhoto' })
        }
    }

    return { userProfileForm, update, loading, populateData, isDisabled, updatePhoto }
}


