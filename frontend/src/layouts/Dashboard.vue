<template>
	<div class="flex w-full h-screen bg-light relative  md:py-0  px-0 overflow-y-hidden ">
		<LayoutsSideBarLeftSidebar v-if="isLoggedIn" :routes="mainShowRoutes" :operational-routes="operationalRoutes()" class="!w-[268px]" />



		<div :class="['relative bg-light page w-full border-dark h-screen sm:h-auto   overflow-hidden ',
			!isLoggedIn ? '!w-full' : 'md:!w-[calc(100vw-268px)]']">
			<LayoutsDashboadHeader :is-business="false" />


			<Alert />
			<div class="w-full h-full relative  overflow-x-hidden bg-light   pb-40">
				<section class="flex-col flex items-stretch">
					<slot />
				</section>
			</div>
			<ModalBase />
		</div>
		<ClientOnly>
			<LayoutsBottomBar v-if="isLoggedIn" :drawer-function="useBottombarModal().toggleBottomMenu" :routes="mainBottomNavRoutes" :operational-routes="operationalRoutes()" />
		</ClientOnly>
	</div>
</template>


<script setup lang="ts">
import { useBottombarModal } from '@/composables/core/modals'
import { dashboardRoutes, operationalRoutes } from '@/composables/utils/menu/dashboard'
import { useUser } from '@/composables/auth/user'



const { isLoggedIn } = useUser()
const mainShowRoutes = dashboardRoutes().filter((route) => true)
const mainBottomNavRoutes = dashboardRoutes().filter((route) => route.main === true)







</script>

<style scoped lang="scss">
.page {
	background-color: #fff;
	// border-top-left-radius: 12px;
	box-shadow: -3px 3px 12px rgb(10 46 101 / 3%);
	// padding: 20px;

	@media (max-width: 680px) {
		border-radius: 0;
		width: 100%;
		padding: 0px;
		box-shadow: none;
	}
}

.mx {
	margin-left: min(20%, 15rem);

	@media (max-width:1024px) {
		margin-left: 3.5rem;
		margin-right: 0;
	}
	@media (max-width:768px) {
		margin-left: 0;
		margin-right: 0;
	}
}
</style>
