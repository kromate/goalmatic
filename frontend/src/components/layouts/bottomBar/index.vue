<template>
	<footer class="md:hidden fixed h-20 bottom-0   bg-light  inset-x-0 flex items-center justify-between px-5 z-[0] text-dark">
		<nuxt-link v-for="n in routes" :key="n.name" :to="n.route" class="flex flex-col justify-center items-center">
			<component :is="n.icon" class="w-5 icon" />
			<p class="text-xs  block truncate w-auto mt-1">
				{{ truncateString(n.name, 10) }}
			</p>
		</nuxt-link>
		<div class="flex flex-col items-center text-light_grey " @click="drawerFunction()">
			<component :is="Menu" class="w-5 icon" />
			<p class="text-xs mt-1">
				more
			</p>
		</div>
	</footer>
</template>

<script setup lang="ts">
import { Menu, Plus } from 'lucide-vue-next'
import { truncateString } from '@/composables/utils/formatter'
import { usePageHeader } from '@/composables/utils/header'

const { headstate } = usePageHeader()




type RouteType = {
    name: string,
    route?: string,
    icon?: any
    main?: boolean

}[]

const props = defineProps({
    routes: {
        type: Array as PropType<RouteType>,
        default: () => [],
        required: true
    },
    operationalRoutes: {
        type: Array as PropType<RouteType>,
        default: () => [],
        required: false
    },
    drawerFunction: {
        type: Function,
        default: () => { },
        required: true
    }
})

</script>


<style scoped lang="scss">
footer{
    @apply border-t border-hover;
    box-shadow: 0px 7px 29px 0px rgba(100, 100, 111, 0.20);
}
.icon{
	@apply border border-tertiary bg-[#FCFAFF] rounded-lg p-1.5 size-9;
}
a {
	@apply text-light_grey ;
&:hover.use-hover{
	@apply bg-hover;
}
}


/* exact link will show the primary color for only the exact matching link */
a.router-link-exact-active {
	@apply text-dark font-medium  ;

}

:deep(:focus) {
	outline: none;
}
</style>


