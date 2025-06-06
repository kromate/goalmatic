import { Timestamp } from 'firebase/firestore'
import { ref, computed } from 'vue'
import { getFirestoreCollectionWithWhereQuery } from '@/firebase/firestore/query'
import { useAlert } from '@/composables/core/notification'
import { useUser } from '@/composables/auth/user'

export const defaultGoalmaticAgent = {
    id: '0',
    name: 'Goalmatic 1.0',
    description: 'The Default agent for Goalmatic',
    public: true,
    user: {
        name: 'Goalmatic'
    },
    spec: {
        systemInfo: 'You are a helpful assistant',
        tools: []
    },
    created_at: Timestamp.fromDate(new Date('2025-01-01'))
}

const fetchedAllAgents = ref([] as any[])
const fetchedUserAgents = ref([] as any[])

export const useFetchAgents = () => {
    const loading = ref(false)

    const fetchAllAgents = async () => {
        loading.value = true
        fetchedAllAgents.value = []
        try {
            await getFirestoreCollectionWithWhereQuery('agents', fetchedAllAgents, { name: 'public', operator: '==', value: true })
        } catch (e: any) {
            console.error('Error fetching public agents:', e)
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${e.message}` })
        } finally {
            loading.value = false
        }
    }
    return { loading, fetchedAllAgents, fetchAllAgents, defaultGoalmaticAgent }
}



export const useFetchUserAgents = () => {
    const { id: user_id } = useUser()
    const loading = ref(false)



    const fetchUserAgents = async () => {
        loading.value = true
        fetchedUserAgents.value = []
        try {
            await getFirestoreCollectionWithWhereQuery('agents', fetchedUserAgents, { name: 'creator_id', operator: '==', value: user_id.value! })
            loading.value = false
        } catch (e: any) {
            loading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${e.message}` })
        }
        return fetchedUserAgents.value
    }

    return { loading, fetchedUserAgents, fetchUserAgents, user_id }
}




export const useHasSelectedAgent = async () => {
    const { fetchUserProfile, user } = useUser()
    const userProfile = await fetchUserProfile()
    const hasSelectedAgent = computed(() => {
        if (!userProfile) return false
        if (userProfile.selected_agent_id || userProfile.selected_agent_id === '0') return true
        return false
    })

    return { hasSelectedAgent }
}
