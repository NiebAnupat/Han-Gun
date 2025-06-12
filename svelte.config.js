import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: false
		}),
		alias: {
			'@/*': 'src/lib/*',
			'$components/*': 'src/lib/components/*',
			'$stores/*': 'src/lib/stores/*',
			'$utils/*': 'src/lib/utils/*',
			'$assets/*': 'src/lib/assets/*',
			"$hooks/*": "src/lib/hooks/*",
		}
	}
};

export default config;
