import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { terser } from "rollup-plugin-terser";

const getOutput = (format, min) => ({
	exports: 'auto',
	file: `dist/index${format ? `.${format}` : ''}.${min ? 'min.' : ''}js`,
	format: format || 'es',
	name: 'IframePlayer',
	plugins: min ? [terser({ format: { comments: false } })] : [],
})

const formats = [
	'',
	'cjs',
	'es',
	'iife',
]

export default {
	input: 'index.ts',
	output: [
		...formats.map(format => getOutput(format)),
		...formats.map(format => getOutput(format, true)),
	],
	plugins: [
		nodeResolve([
			'.js',
			'.ts',
			'.tsx'
		]),
		commonjs(),
		typescript({
			tsconfig: path.resolve(__dirname, './tsconfig.json'),
		}),
	],
};
