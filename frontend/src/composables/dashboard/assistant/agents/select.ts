import { useStorage } from '@vueuse/core'
import { Timestamp } from 'firebase/firestore'
import { defaultGoalmaticAgent } from './fetch'
import { updateFirestoreDocument } from '@/firebase/firestore/edit'
import { getSingleFirestoreDocument } from '@/firebase/firestore/fetch'
import { useUser } from '@/composables/auth/user'


export const selectedAgent = useStorage('selectedAgent', defaultGoalmaticAgent as Record<string, any>)


export const useSelectAgent = () => {
    const { id: user_id } = useUser()
    const loading = ref(false)

    const selectAgent = async (agentDetails: Record<string, any>) => {
        loading.value = true
        await updateFirestoreDocument('users', user_id.value!, { selected_agent_id: agentDetails.id, updated_at: Timestamp.fromDate(new Date()) })
        selectedAgent.value = agentDetails as any
        loading.value = false
        useRouter().push('/agents')
    }

    return { loading, selectAgent, selectedAgent }
}

export const updateSelectedAgent = (agentDetails: Record<string, any>) => {
    selectedAgent.value = agentDetails as any
}

export const useOnAssistantLoad = () => {
    const { id: user_id } = useUser()
    const selectedUser = ref()
    const selectedAgentRef = ref()
    const fetchSelectedAgent = async () => {
        if (import.meta.server) return
        await getSingleFirestoreDocument('users', user_id.value!, selectedUser)
        try {
            if (selectedUser.value?.selected_agent_id && selectedUser.value?.selected_agent_id !== '0') {
                await getSingleFirestoreDocument('agents', selectedUser.value?.selected_agent_id, selectedAgentRef)
                selectedAgent.value = selectedAgentRef.value
            } else {
                selectedAgent.value = defaultGoalmaticAgent as any
            }
        } catch (error) {
            console.error(error)
        }
    }

    return { fetchSelectedAgent, selectedAgent }
}
