<template>
	<Modal
		modal="$atts.modal"
		:title="title"
		:is-full-height="false"
		:props-modal="propsModal"
	>
		<p class="text-dark text-lg tracking-[0.1rem] text-center">
			{{ description }}
		</p>

		<div class="grid grid-cols-2 gap-4 mt-6">
			<button class="btn-primary bg-dark" @click="closeAlert">
				No
			</button>
			<button class="btn-primary border-danger bg-danger text-light hover:bg-danger" :disabled="loading" @click="call_function()">
				<span v-if="!loading"> Yes</span>
				<Spinner v-else />
			</button>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import { useConfirmationModal } from '@/composables/core/confirmation'

const { call_function, closeAlert, description, title, loading } = useConfirmationModal()

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
