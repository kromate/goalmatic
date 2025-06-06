<template>
	<div>
		<div class="mb-4">
			<!-- AI Mode Toggle for Message Field -->
			<div class="flex items-center justify-between mb-1">
				<label class="block font-medium">Message</label>
				<!-- AI Mode Selector - Only for message field since it's ai_enabled in the node definition -->
				<select
					v-model="aiMode.message"
					class="ai_selector"
					@change="handleAiModeChange('message')"
				>
					<option value="manual">
						Manual
					</option>
					<option value="ai">
						AI
					</option>
				</select>
			</div>



			<MentionEditor
				v-model="form.message"
				:mention-items="props.previousNodeOutputs"
				:class-node="['input-textarea', aiMode.message === 'ai' ? 'ai-mode-input' : ''].filter(Boolean).join(' ')"
				:placeholder="aiMode.message === 'ai' ? 'Enter prompt for message content' : 'Enter your message'"
			/>
			<div v-if="aiMode.message === 'ai'" class="mb-2 rounded-md  text-sm text-primary italic">
				<span>Write a prompt for the AI to generate content from</span>
			</div>
		</div>
		<div class="mb-4">
			<label class="block font-medium mb-1">Recipient Type</label>
			<select v-model="form.recipientType" class="input-field w-full">
				<option value="user">
					User's WhatsApp
				</option>
				<option value="custom">
					Custom Phone Number
				</option>
			</select>
		</div>
		<div class="mb-4">
			<label class="block font-medium mb-1">Phone Number</label>
			<PhoneInput v-model="form.phoneNumber" :disabled="form.recipientType === 'user'" placeholder="e.g. +1234567890" />

			<div v-if="form.recipientType === 'custom'">
				<button v-if="!verified" type="button" class="btn-primary mt-2" :disabled="loading || verified || form.phoneNumber.length < 13" @click="openOtpModal">
					Verify Phone
				</button>
				<span v-if="verified" class="text-green-600 ml-2">Verified &#10003;</span>
			</div>
		</div>

		<div class="flex justify-end gap-2 mt-4">
			<button class="btn-outline flex-1" @click="$emit('cancel')">
				Cancel
			</button>
			<button class="btn-primary flex-1" :disabled="!canSave" @click="save">
				Save
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, reactive } from 'vue'
import { useUser } from '@/composables/auth/user'
import { useCoreModal } from '@/composables/core/modals'
import { getSingleFirestoreDocument, getFirestoreSubCollection } from '@/firebase/firestore/fetch'
import { getFirestoreSubCollectionWithWhereQuery } from '@/firebase/firestore/query'


const props = defineProps({
	payload: Object,
	nodeProps: Array,
	formValues: Object,
	hasProps: Boolean,
	loading: Boolean,
	previousNodeOutputs: {
		type: Object,
		required: false,
		default: () => ({})
	}
})

const emit = defineEmits(['save', 'cancel'])
const isVerified = ref(false)
const verifiedPhoneNumber = ref('')

// AI mode tracking for message field
const aiMode = reactive({
	message: 'manual'
})

const form = ref({
	message: '',
	recipientType: 'user',
	phoneNumber: ''
})

const verified = computed({
  get: () => {
    return isVerified.value && verifiedPhoneNumber.value && form.value.phoneNumber === verifiedPhoneNumber.value
  },
  set: (val:boolean) => {
    isVerified.value = val
  }
})
const user = useUser()

// Handle AI mode change
const handleAiModeChange = (propKey: string) => {
	// Don't clear the value when switching modes - users can enter prompts in AI mode
	// The field value will be treated as either content (manual) or prompt (AI) based on the mode
}

// Prepopulate from formValues if editing
onMounted(async () => {
	if (props.formValues) {
    form.value = { ...form.value, ...props.formValues }
    if (form.value.phoneNumber) {
      isVerified.value = true
      verifiedPhoneNumber.value = form.value.phoneNumber
    }
	}

	// Initialize AI mode from payload if available
	if (props.payload?.aiEnabledFields && props.payload.aiEnabledFields.includes('message')) {
		aiMode.message = 'ai'
	} else {
		aiMode.message = 'manual'
	}

	if (form.value.recipientType === 'user') {
		await prepopulateUserPhone()
	}
})

watch(() => form.value.recipientType, async (val) => {
	if (val === 'user') {
		await prepopulateUserPhone()
		verified.value = true
	}
})

async function prepopulateUserPhone() {
	// Fetch WhatsApp integration for user using a where query
	const userId = user.id.value
	if (!userId) return
	// Use ref for the integrations array
	const userIntegrationsRef = ref([])
	// Fetch the subcollection 'integrations' under the user document, filtered by provider 'WHATSAPP'
	await getFirestoreSubCollectionWithWhereQuery('users', userId, 'integrations', userIntegrationsRef, { name: 'provider', operator: '==', value: 'WHATSAPP' })


	let phone = ''
	if (userIntegrationsRef.value && userIntegrationsRef.value.length > 0) {
		const wa = userIntegrationsRef.value[0] as any
		if (wa && typeof wa === 'object' && 'phone' in wa) phone = wa.phone as string
	}
	form.value.phoneNumber = `+${phone}` || ''
}



function openOtpModal() {
	useCoreModal().openOtpVerificationModal({
		phoneNumber: form.value.phoneNumber,
		onVerified: () => {
      verified.value = true
      verifiedPhoneNumber.value = form.value.phoneNumber
      useCoreModal().closeOtpVerificationModal()
		}
	})
}


const canSave = computed(() => {
  if (!form.value.message) return false
	if (form.value.recipientType === 'custom') {
		return !!form.value.phoneNumber && verified.value
	}
	if (form.value.recipientType === 'user') {
		return !!form.value.phoneNumber
	}
	return false
})

function save() {
	// Create AI enabled fields list - only include message if it's in AI mode
	const aiEnabledFields = aiMode.message === 'ai' ? ['message'] : []
	const nonCloneables = ['phoneNumber']

  const payload = {
		message: form.value.message,
		recipientType: form.value.recipientType,
		phoneNumber: form.value.phoneNumber,
		aiEnabledFields,
		nonCloneables
	}
	emit('save', payload)
}
</script>



