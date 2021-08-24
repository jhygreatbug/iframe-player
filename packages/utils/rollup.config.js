import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import path from 'path';

export default {
	input: 'index.ts',
	output: [{
		exports: 'auto',
		file: `index.js`,
		format: 'es',
	}],
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
