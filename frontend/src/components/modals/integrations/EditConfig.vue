<template>
	<Modal
		modal="$atts.modal"
		:title="modalData.title"
		:is-full-height="false"
		:props-modal="propsModal"
	>
		<form class="auth-form mt-4 p-1" @submit.prevent="">
			<div v-for="field in modalData.fields" :key="field.key" class="field relative">
				<label for="start">{{ field.name }}</label>
				<Select
					v-model="modalData.config[field.key]"
					:options="field.options ? field.options : [] as any"
					class="input-field"
				/>
			</div>

			<div class="grid grid-cols-1 gap-4 mt-6 w-full ">
				<button class="btn-primary text-light" :disabled="loading" @click="updateConfig">
					<span v-if="!loading"> Update </span>
					<Spinner v-else />
				</button>
			</div>
		</form>
	</Modal>
</template>

<script setup lang="ts">
import { useEditIntegrationsConfig } from '@/composables/dashboard/integrations/editConfig'

const { modalData, loading, updateConfig } = useEditIntegrationsConfig()

defineProps({
	payload: {
		type: Object as PropType<Record<string, any> | null>,
		default: null,
		required: false
	},
	propsModal: {
		type: String,
		required: false // Adjust as needed
	}
})

</script>

<style>

</style>
