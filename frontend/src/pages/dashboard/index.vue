<template>
	<main>
		Dashboard
	</main>
</template>

<script setup lang="ts">

import { usePageHeader } from '@/composables/utils/header'




definePageMeta({
	layout: 'dashboard',
	middleware: ['is-authenticated', () => {
		usePageHeader().setPageHeader({
			title: 'Home',
			description: 'Welcome to your dashboard',
			btnText: 'Create New Agent',
			btnCall: () => useRouter().push('/agents'),
			shouldShowFab: true,
			shouldShowTab: usePageHeader().isLargeScreen.value

		})
	}]
})
</script>

<style scoped></style>
