import { Plugin, Setting, PluginSettingTab, App } from 'obsidian';

interface FontSizeSliderSettings {
	fontSize: number;
	minFontSize: number;
	maxFontSize: number;
	showInStatusBar: boolean;
	sliderWidth: number;
}

const DEFAULT_SETTINGS: FontSizeSliderSettings = {
	fontSize: 16,
	minFontSize: 8,
	maxFontSize: 32,
	showInStatusBar: true,
	sliderWidth: 120
};

export default class FontSizeSliderPlugin extends Plugin {
	settings: FontSizeSliderSettings;
	statusBarItem: HTMLElement;
	sliderContainer: HTMLElement;
	slider: HTMLInputElement;
	sizeDisplay: HTMLSpanElement;

	async onload() {
		await this.loadSettings();

		// Add status bar slider
		if (this.settings.showInStatusBar) {
			this.addStatusBarSlider();
		}

		// Add settings tab
		this.addSettingTab(new FontSizeSliderSettingTab(this.app, this));

		// Apply initial font size
		this.applyFontSize(this.settings.fontSize);

		// Add commands for keyboard shortcuts
		this.addCommand({
			id: 'increase-font-size',
			name: 'Increase font size',
			callback: () => {
				const newSize = Math.min(this.settings.fontSize + 1, this.settings.maxFontSize);
				this.updateFontSize(newSize);
			}
		});

		this.addCommand({
			id: 'decrease-font-size',
			name: 'Decrease font size',
			callback: () => {
				const newSize = Math.max(this.settings.fontSize - 1, this.settings.minFontSize);
				this.updateFontSize(newSize);
			}
		});

		this.addCommand({
			id: 'reset-font-size',
			name: 'Reset font size to default',
			callback: () => {
				this.updateFontSize(DEFAULT_SETTINGS.fontSize);
			}
		});
	}

	onunload() {
		// Remove custom CSS
		this.removeFontStyles();
	}

	addStatusBarSlider() {
		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.addClass('font-slider-status-bar');
		
		// Create container for the slider and label
		this.sliderContainer = this.statusBarItem.createDiv('font-slider-container');
		
		// Add font icon
		const fontIcon = this.sliderContainer.createSpan('font-slider-icon');
		fontIcon.innerHTML = '🔤';
		fontIcon.title = 'Font Size';
		
		// Create the slider
		this.slider = this.sliderContainer.createEl('input', {
			type: 'range',
			cls: 'font-slider'
		});
		
		this.slider.min = this.settings.minFontSize.toString();
		this.slider.max = this.settings.maxFontSize.toString();
		this.slider.value = this.settings.fontSize.toString();
		this.slider.style.width = `${this.settings.sliderWidth}px`;
		
		// Create size display
		this.sizeDisplay = this.sliderContainer.createSpan('font-size-display');
		this.sizeDisplay.textContent = `${this.settings.fontSize}px`;
		
		// Add event listeners
		this.slider.addEventListener('input', (e) => {
			const target = e.target as HTMLInputElement;
			const newSize = parseInt(target.value);
			this.updateFontSize(newSize, false); // Don't save immediately while dragging
		});
		
		// Save on mouse up
		this.slider.addEventListener('mouseup', (e) => {
			const target = e.target as HTMLInputElement;
			const newSize = parseInt(target.value);
			this.updateFontSize(newSize, true);
		});
		
		// Add CSS styles
		this.addSliderStyles();
	}

	updateFontSize(newSize: number, save: boolean = true) {
		newSize = Math.max(this.settings.minFontSize, Math.min(this.settings.maxFontSize, newSize));
		
		this.settings.fontSize = newSize;
		this.applyFontSize(newSize);
		
		// Update slider and display
		if (this.slider) {
			this.slider.value = newSize.toString();
		}
		if (this.sizeDisplay) {
			this.sizeDisplay.textContent = `${newSize}px`;
		}
		
		if (save) {
			this.saveSettings();
		}
	}

	applyFontSize(fontSize: number) {
		// Remove existing styles
		this.removeFontStyles();
		
		// Set CSS custom property for proportional base font size
		document.documentElement.style.setProperty('--font-slider-base-size', `${fontSize}px`);
		
		// Create proportional scaling CSS for all markdown elements
		const style = document.createElement('style');
		style.id = 'font-slider-proportional-styles';
		style.textContent = `
			/* Headings with proportional hierarchy */
			.markdown-preview-view h1, .markdown-source-view .cm-header-1 {
				font-size: calc(var(--font-slider-base-size) * 2.25) !important;
			}
			.markdown-preview-view h2, .markdown-source-view .cm-header-2 {
				font-size: calc(var(--font-slider-base-size) * 1.75) !important;
			}
			.markdown-preview-view h3, .markdown-source-view .cm-header-3 {
				font-size: calc(var(--font-slider-base-size) * 1.5) !important;
			}
			.markdown-preview-view h4, .markdown-source-view .cm-header-4 {
				font-size: calc(var(--font-slider-base-size) * 1.25) !important;
			}
			.markdown-preview-view h5, .markdown-source-view .cm-header-5 {
				font-size: calc(var(--font-slider-base-size) * 1.125) !important;
			}
			.markdown-preview-view h6, .markdown-source-view .cm-header-6 {
				font-size: calc(var(--font-slider-base-size) * 1.0625) !important;
			}
			
			/* Body text - base size */
			.markdown-preview-view p, 
			.markdown-source-view .cm-line,
			.markdown-source-view.mod-cm6 .cm-editor,
			.view-content .markdown-source-view {
				font-size: var(--font-slider-base-size) !important;
			}
			
			/* Code elements - slightly smaller */
			.markdown-preview-view code,
			.markdown-source-view .cm-inline-code {
				font-size: calc(var(--font-slider-base-size) * 0.9) !important;
			}
			.markdown-preview-view pre,
			.markdown-source-view .cm-line.HyperMD-codeblock {
				font-size: calc(var(--font-slider-base-size) * 0.9) !important;
			}
			
			/* Tables */
			.markdown-preview-view table,
			.markdown-preview-view th,
			.markdown-preview-view td {
				font-size: calc(var(--font-slider-base-size) * 0.95) !important;
			}
			
			/* Lists */
			.markdown-preview-view li,
			.markdown-preview-view ul,
			.markdown-preview-view ol {
				font-size: var(--font-slider-base-size) !important;
			}
			
			/* Blockquotes */
			.markdown-preview-view blockquote {
				font-size: calc(var(--font-slider-base-size) * 0.95) !important;
			}
		`;
		document.head.appendChild(style);
	}

	removeFontStyles() {
		document.documentElement.style.removeProperty('--font-slider-base-size');
		const existingStyle = document.getElementById('font-slider-proportional-styles');
		if (existingStyle) {
			existingStyle.remove();
		}
	}

	addSliderStyles() {
		if (document.getElementById('font-slider-styles')) return;
		
		const style = document.createElement('style');
		style.id = 'font-slider-styles';
		style.textContent = `
			.font-slider-status-bar {
				display: flex;
				align-items: center;
				gap: 4px;
			}
			
			.font-slider-container {
				display: flex;
				align-items: center;
				gap: 6px;
				padding: 2px 6px;
				border-radius: 4px;
				background: var(--background-modifier-border);
			}
			
			.font-slider-icon {
				font-size: 14px;
				opacity: 0.7;
				cursor: help;
			}
			
			.font-slider {
				appearance: none;
				-webkit-appearance: none;
				background: transparent;
				cursor: pointer;
				height: 4px;
				border-radius: 2px;
				background: var(--background-modifier-border-hover);
				outline: none;
			}
			
			.font-slider::-webkit-slider-thumb {
				appearance: none;
				-webkit-appearance: none;
				height: 14px;
				width: 14px;
				border-radius: 50%;
				background: var(--interactive-accent);
				cursor: pointer;
				border: 2px solid var(--background-primary);
				box-shadow: 0 1px 3px rgba(0,0,0,0.2);
			}
			
			.font-slider::-moz-range-thumb {
				height: 14px;
				width: 14px;
				border-radius: 50%;
				background: var(--interactive-accent);
				cursor: pointer;
				border: 2px solid var(--background-primary);
				box-shadow: 0 1px 3px rgba(0,0,0,0.2);
			}
			
			.font-slider:hover::-webkit-slider-thumb {
				transform: scale(1.1);
			}
			
			.font-slider:hover::-moz-range-thumb {
				transform: scale(1.1);
			}
			
			.font-size-display {
				font-size: 11px;
				opacity: 0.8;
				min-width: 28px;
				text-align: center;
				font-family: var(--font-monospace);
			}
		`;
		document.head.appendChild(style);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class FontSizeSliderSettingTab extends PluginSettingTab {
	plugin: FontSizeSliderPlugin;

	constructor(app: App, plugin: FontSizeSliderPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Font Size Slider Settings' });

		new Setting(containerEl)
			.setName('Default font size')
			.setDesc('The default font size in pixels')
			.addSlider(slider => slider
				.setLimits(8, 32, 1)
				.setValue(this.plugin.settings.fontSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.fontSize = value;
					this.plugin.updateFontSize(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Minimum font size')
			.setDesc('The minimum font size allowed')
			.addSlider(slider => slider
				.setLimits(6, 20, 1)
				.setValue(this.plugin.settings.minFontSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.minFontSize = value;
					if (this.plugin.slider) {
						this.plugin.slider.min = value.toString();
					}
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Maximum font size')
			.setDesc('The maximum font size allowed')
			.addSlider(slider => slider
				.setLimits(20, 48, 1)
				.setValue(this.plugin.settings.maxFontSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxFontSize = value;
					if (this.plugin.slider) {
						this.plugin.slider.max = value.toString();
					}
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show in status bar')
			.setDesc('Display the font size slider in the status bar')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showInStatusBar)
				.onChange(async (value) => {
					this.plugin.settings.showInStatusBar = value;
					await this.plugin.saveSettings();
					
					// Recreate status bar item
					if (this.plugin.statusBarItem) {
						this.plugin.statusBarItem.remove();
					}
					if (value) {
						this.plugin.addStatusBarSlider();
					}
				}));

		new Setting(containerEl)
			.setName('Slider width')
			.setDesc('Width of the slider in pixels')
			.addSlider(slider => slider
				.setLimits(80, 200, 10)
				.setValue(this.plugin.settings.sliderWidth)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.sliderWidth = value;
					if (this.plugin.slider) {
						this.plugin.slider.style.width = `${value}px`;
					}
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Reset to default')
			.setDesc('Reset font size to the default value')
			.addButton(button => button
				.setButtonText('Reset')
				.onClick(() => {
					this.plugin.updateFontSize(DEFAULT_SETTINGS.fontSize);
				}));
	}
}