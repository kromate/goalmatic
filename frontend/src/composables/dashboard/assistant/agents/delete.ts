
import { Timestamp } from 'firebase/firestore'
import { selectedAgent } from './select'
import { deleteFirestoreDocument } from '@/firebase/firestore/delete'
import { useAlert } from '@/composables/core/notification'
import { useConfirmationModal } from '@/composables/core/confirmation'
import { useUser } from '@/composables/auth/user'
import { updateFirestoreDocument } from '@/firebase/firestore/edit'

const deleteAgentData = ref()


export const useDeleteAgent = () => {
	const loading = ref(false)
	const { id: user_id } = useUser()

	const setDeleteAgentData = (data: Record<string, any>) => {
		deleteAgentData.value = data

		useConfirmationModal().openAlert({ type: 'Alert', title: 'Delete Agent', desc: `Are you sure you want to delete  "${deleteAgentData.value.name}" Agent? `, call_function: deleteAgent, loading })
	}
	const deleteAgent = async () => {
		loading.value = true
		try {
			await deleteFirestoreDocument('agents', deleteAgentData.value.id)
			if (selectedAgent.value.id === deleteAgentData.value.id) {
				await updateFirestoreDocument('users', user_id.value!, { selected_agent_id: null, updated_at: Timestamp.fromDate(new Date()) })
			}
			loading.value = false
			useConfirmationModal().closeAlert()
			useAlert().openAlert({ type: 'SUCCESS', msg: 'Agent Deleted successfully' })
			useRouter().push('/agents/explore')
		} catch (e: any) {
			loading.value = false
			useAlert().openAlert({ type: 'ERROR', msg: `Error: ${e.message}` })
		}
	}
	return { loading, deleteAgent, setDeleteAgentData }
}
