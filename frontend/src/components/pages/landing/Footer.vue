<template>
	<section class="container xl:min-w-[1500px] md:px-12 px-4">
		<footer class="flex flex-col items-center text-center w-full md:mb-8 mb-4">
			<div class="flex  flex-row gap-4 items-center w-full justify-between px-4">
				<img src="/lt.svg" alt="logo" class=" md:w-48 w-32">
				<div class="flex gap-x-4">
					<a v-for="(item, itemIdx) in social" :key="itemIdx" :href="item.href" target="_blank" class="text-gray-400 hover:text-gray-500">
						<span class="sr-only">{{ item.name }}</span>
						<component :is="item.icon" class="md:h-6 md:w-6 h-4 w-4" aria-hidden="true" />
					</a>
				</div>
			</div>
			<hr class="w-full h-px bg-line my-3">

			<div class="flex flex-col md:flex-row gap-2 items-center justify-between text-sm leading-7 w-full">
				<p class=" text-[#666666] text-xs">
					All rights reserved by &copy; Taaskly
				</p>
				<div class="flex items-center gap-4 text-xs">
					<nuxt-link to="/privacy">
						Privacy Policy
					</nuxt-link>
					<nuxt-link to="/terms">
						Terms of Service
					</nuxt-link>
				</div>
			</div>
		</footer>
	</section>
</template>

<script lang='ts' setup>
import { TwitterIcon, Instagram, Linkedin, MoveRight } from 'lucide-vue-next'




const social = [
  {
    name: 'Twitter',
    href: 'https://x.com/goalmatic_io',
    icon: TwitterIcon
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/goalmatic.io/',
    icon: Instagram
    },
    {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/goalmatic/',
    icon: Linkedin
  }
]
</script>

<style scoped>

</style>
