import type { TResponseEventType } from '@iframe-player/types';
import IframePlayer from '@iframe-player/user';
import 'core-js/web/url-search-params';
import 'core-js/es/promise';

const $iframe = document.getElementById('iframe') as HTMLIFrameElement;
let player: IframePlayer | null = null;
function init(src: string) {
	console.log('init', src)
	$iframe.src = src;
	if (player) {
		player.destroy();
	}
	player = new IframePlayer({
		target: $iframe,
		playUrl: src,
		// autoPlay: true,
		// allowMutedAutoPlay: true,
		// controls: false,
	});
	(window as any).player = player;

	const events: TResponseEventType[] = [
		'can-play',
		'pause',
		'play',
		'ended',
		'time-update',
		'volume-change',
		'presentation-mode-changed',
		'error',
	];
	events.forEach(event => {
		player!.on(event, (value: unknown) => {
			try {
				displayEvent(event, value);
			} catch (e) {
				console.log(e);
			}
		});
	});
}


const $iframeInput = document.getElementById(
	'iframe-input',
) as HTMLInputElement;
const $iframeGoButton = document.getElementById(
	'iframe-button',
) as HTMLButtonElement;
const searchParams = new URLSearchParams(window.location.search);
const initSrc = searchParams.get('src') ?? '';
if (initSrc) {
	$iframeInput.value = initSrc;
	init(initSrc);
}
$iframeGoButton.addEventListener('click', () => {
	const src = $iframeInput.value;
	init(src);
});

const $eventContainer = document.querySelector(
	'.events .section__list',
) as HTMLElement;
let counter = 0;
function displayEvent(eventType: string, value: unknown) {
	counter++;
	$eventContainer.innerHTML += `<li>${counter}: ${eventType} ${
		value === null ? '' : JSON.stringify(value)
	}</li>`;
	$eventContainer.scrollTo(0, $eventContainer.scrollHeight);
}

const controls = [
	{ eventType: 'setPlay' },
	{ eventType: 'setPause' },
	{ eventType: 'setMuted', values: [{ name: 'muted', type: 'checkbox' }] },
	{
		eventType: 'setPresentationMode',
		values: [{ name: 'mode', type: 'input' }],
	},

	{ eventType: 'getDuration', promise: true },
	{ eventType: 'getCurrentTime', promise: true },
	{ eventType: 'getMuted', promise: true },
	{ eventType: 'getPresentationMode', promise: true },
];
const $controlsContainer = document.querySelector(
	'.controls .section__list',
) as HTMLElement;
const $fragment = document.createDocumentFragment();
controls.forEach(({ eventType, values, promise }) => {
	const $li = document.createElement('li');
	const inputs = Array.isArray(values)
		? values.map(
				({ type, name }) => `<input type="${type}" name="${name}" />`,
		  )
		: '';
	$li.innerHTML = `
		<div class="controls__left">
			${eventType}
			${inputs}
		</div>
		<div class="controls__right">
			<button class="controls__button">emit</button>
		</div>`;
	$li.querySelector('.controls__button')?.addEventListener(
		'click',
		async function () {
			if (!player) {
				return;
			}
			// todo: 优化
			const value: any = {};
			if (values) {
				values.forEach(({ name, type }) => {
					const $dom = document.querySelector(
						`input[name="${name}"]`,
					) as HTMLInputElement;
					if (!$dom) {
						return;
					}
					value[name] =
						type === 'checkbox' ? $dom.checked : $dom.value;
				});
			}
			// @ts-expect-error
			const res = await player[eventType](value);
			if (promise) {
				console.log(res);
			}
		},
	);
	$fragment.appendChild($li);
});
$controlsContainer.appendChild($fragment);
