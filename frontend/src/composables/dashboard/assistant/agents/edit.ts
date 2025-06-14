import { Timestamp } from 'firebase/firestore'
import { ref, watch } from 'vue'
import { useEditToolConfig } from './tools/config'
import {
    isEditingSystemInfo,
    isEditingTools,
    toolsModel,
    isEditingName,
    isEditingDescription,
    UserIntegrations,
    systemInfoModel
} from './details'
import { agentDetails as agentDetailsRef } from './id'
import { updateFirestoreDocument } from '@/firebase/firestore/edit'
import { useAlert } from '@/composables/core/notification'
import { useFetchIntegrations } from '@/composables/dashboard/integrations/fetch'
import { useAssistantModal } from '@/composables/core/modals'

export const useEditAgent = () => {
    const updateNameLoading = ref(false)
    const updateDescriptionLoading = ref(false)
    const updateSystemInfoLoading = ref(false)
    const updateToolsLoading = ref(false)
    const updateAvatarLoading = ref(false)
    const toggleVisibilityLoading = ref(false)
    const { getConfiguredTools } = useEditToolConfig()

    watch(isEditingTools, async () => {
        if (isEditingTools.value) {
            const { fetchedIntegrations, fetchUserIntegrations } = useFetchIntegrations()
            await fetchUserIntegrations()
            UserIntegrations.value = fetchedIntegrations.value
        }
    })

    const updateSystemInfo = async (id: string, spec: any) => {
        try {
            updateSystemInfoLoading.value = true
            await updateFirestoreDocument('agents', id, {
                spec: {
                    ...spec,
                    systemInfo: systemInfoModel.value.replace(/<(?!\/?(p|br|strong|em|u|s|ul|ol|li|h[1-6]|blockquote)(?=>|\s.*>))\/?.*?>/g, '')
                }
            })

            isEditingSystemInfo.value = false
            updateSystemInfoLoading.value = false
            agentDetailsRef.value.spec.systemInfo = systemInfoModel.value
            useAlert().openAlert({ type: 'SUCCESS', msg: 'System information updated successfully' })
        } catch (error) {
            updateSystemInfoLoading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        }
    }

    const updateTools = async (id: string, spec: any) => {
        try {
            updateToolsLoading.value = true

            // Get configured tools
            const configuredTools = getConfiguredTools()

            await updateFirestoreDocument('agents', id, {
                spec: {
                    ...spec,
                    tools: toolsModel.value,
                    toolsConfig: configuredTools
                }
            })

            isEditingTools.value = false
            updateToolsLoading.value = false
            agentDetailsRef.value.spec.tools = toolsModel.value
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Tools updated successfully' })
        } catch (error) {
            updateToolsLoading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        }
    }

    /**
     * Toggle agent visibility between public and private
     * @param agent The agent to toggle visibility for
     */
    const toggleAgentVisibility = async (agent: Record<string, any>) => {
        if (!agent || !agent.id) {
            useAlert().openAlert({ type: 'ERROR', msg: 'Invalid agent data' })
            return
        }

        toggleVisibilityLoading.value = true
        try {
            // Toggle the public flag
            const isPublic = agent.public === true

            await updateFirestoreDocument('agents', agent.id, {
                public: !isPublic,
                updated_at: Timestamp.fromDate(new Date())
            })

            // Update the local agent object to reflect the change
            agent.public = !isPublic

            useAlert().openAlert({
                type: 'SUCCESS',
                msg: `Agent is now ${!isPublic ? 'public' : 'private'}`
            })
        } catch (error) {
            console.error('Error toggling agent visibility:', error)
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        } finally {
            toggleVisibilityLoading.value = false
        }
    }


    const updateName = async (id: string, name: string) => {
        try {
            updateNameLoading.value = true

            await updateFirestoreDocument('agents', id, {
                name: name.trim(),
                updated_at: Timestamp.fromDate(new Date())
            })

            isEditingName.value = false
            updateNameLoading.value = false
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Agent name updated successfully' })
        } catch (error) {
            updateNameLoading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        }
    }

    const updateDescription = async (id: string, description: string) => {
        try {
            updateDescriptionLoading.value = true

            await updateFirestoreDocument('agents', id, {
                description: description.trim(),
                updated_at: Timestamp.fromDate(new Date())
            })

            isEditingDescription.value = false
            updateDescriptionLoading.value = false
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Agent description updated successfully' })
        } catch (error) {
            updateDescriptionLoading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        }
    }

    const updateAvatar = async (id: string, avatar: string) => {
        try {
            updateAvatarLoading.value = true

            await updateFirestoreDocument('agents', id, {
                avatar,
                updated_at: Timestamp.fromDate(new Date())
            })

            updateAvatarLoading.value = false
            agentDetailsRef.value.avatar = avatar
            useAlert().openAlert({ type: 'SUCCESS', msg: 'Agent avatar updated successfully' })
        } catch (error) {
            updateAvatarLoading.value = false
            useAlert().openAlert({ type: 'ERROR', msg: `Error: ${error}` })
        }
    }

    const openVisibilityConfirmation = (agent: Record<string, any>) => {
        useAssistantModal().openConfirmVisibility({
            agent,
            onConfirm: () => toggleAgentVisibility(agent)
        })
    }

    return {
        // Loading states
        updateSystemInfoLoading, updateToolsLoading, updateNameLoading, updateDescriptionLoading, updateAvatarLoading, toggleVisibilityLoading,

        // Functions
        updateSystemInfo, updateTools, updateName, updateDescription, updateAvatar, toggleAgentVisibility, openVisibilityConfirmation
    }
}
