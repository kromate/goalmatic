<template>
	<Modal
		modal="$atts.modal"
		type="bottom_bar"
	>
		<aside class="overflow-y-auto max-h-[70%]">
			<div class="relative h-full flex flex-col gap-2 mb-4">
				<span v-for="menu in dashboardRoutes()" :key="menu.name" class="w-full h-full">
					<nuxt-link
						:to="menu.route"
						active-class="link_active" class="link"
					>
						<component :is="menu.icon" class="mr-4 w-5" />
						<p class="text-base">
							{{ menu.name }}
						</p>
					</nuxt-link>
				</span>

				<!-- Operational Routes Section -->
				<div v-if="operationalRoutes().length > 0" class="mt-4 pt-4 border-t border-gray-200">
					<span v-for="menu in operationalRoutes()" :key="menu.name" class="w-full h-full">
						<nuxt-link
							:to="menu.route"
							active-class="link_active"
							:class="[
								'link',
								menu.bg || '',
								menu.color || ''
							]"
						>
							<component :is="menu.icon" class="mr-4 w-5" />
							<p class="text-base">
								{{ menu.name }}
							</p>
						</nuxt-link>
					</span>
				</div>
			</div>
		</aside>
	</Modal>
</template>

<script setup lang="ts">
import { dashboardRoutes, operationalRoutes } from '@/composables/utils/menu/dashboard'
import { modal, closeModalType } from '@/composables/core/modal'

const { stack, close } = modal

watch(() => useRoute().path, () => {
	if (stack.value.includes('BottombarMainBottomMenu')) {
		closeModalType()
		closeModalType()
		close('BottombarMainBottomMenu')
	}
})
</script>

<style scoped lang="scss">

:deep(a, a.mbtn, .mbtn) {
	@apply  w-full h-[51px] px-4 text-base duration-[10ms] rounded
}
a.mbtn, .mbtn {
	@apply  w-full h-[51px] px-4 text-base duration-[10ms] rounded
}
/* exact link will show the dark color for only the exact matching link */
:deep(a.router-link-exact-active.black) {

		@apply text-dark font-semibold;
	// color: var(--primary);
	border-color: var(--primary);
	background-color: #F4F3FF;
	// & > svg {
	// 	color: var(--light);
	// }
}
.link {
	@apply flex items-center gap-2.5  py-3 !px-4 rounded-lg hover:text-primary hover:font-medium hover:border hover:bg-tertiary border-primary
}

.link_active {
	@apply text-primary font-medium border bg-tertiary border-primary
}
</style>
