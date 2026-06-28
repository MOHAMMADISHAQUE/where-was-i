import * as vscode from 'vscode';
import { execSync } from 'child_process';

interface SessionData {
	id: string;
	workspace: string;
	branch: string;
	openFiles: string[];
	activeFile: string | null;
	cursorPositions: { [file: string]: { line: number; character: number } };
	timestamp: string;
	note: string;
}

function getGitBranch(workspacePath: string): string {
	try {
		return execSync('git rev-parse --abbrev-ref HEAD', { cwd: workspacePath }).toString().trim();
	} catch {
		return 'unknown';
	}
}

const greetings = [
	'Wapas aa gaye!',
	'Kahan the aap?',
	'Lo aa gaye!',
	'Aa gaye finally!',
	'Swagat hai aapka!',
	'Arrey wah, aa gaye!',
	'Chalte raho, aa gaye!',
	'Chai peeke aa gaye?',
	'Meeting survive kar liya!',
	'Bug fix karne aa gaye?',
	'Deadline yaad aa gayi kya?',
	'Neend se uthke aa gaye?',
	'Lo bhai, hero aa gaya!',
	'Keyboard ready kar lo!',
	'Phir se aa gaye — good!',
	'Stack Overflow band karo, kaam karo!',
	'Aaj toh kuch hoga!',
	'Bina coffee ke? Brave ho.',
	'Commit karna mat bhoolna!',
	'Git push kiya tha kya?',
	'Arrey yaar, aa gaye aap!',
	'Sab yaad hai na?',
	'Chal shuru karte hain!',
	'Boss aa raha hai kya?',
	'Productive feel ho raha hai!',
	'Aaj toh koi bug nahi aayega.',
	'Console.log band karo, deploy karo!',
	'Thaka hua dev aa gaya!',
	'Code review se bach ke aa gaye?',
	'Pehle chai, phir code.',
	'Duniya ki best extension khol li!',
	'Kaam karne ka mann hai aaj?',
	'Backup liya tha na?',
	'Lo context ready hai!',
	'Koi naya feature daalna hai?',
	'Aaj koi merge conflict nahi aayega.',
	'Bahut brave ho — VS Code khola!',
	'Aaj toh production break nahi karenge.',
	'Pichle session ka hisaab lo!',
	'Chhuti ke baad aa gaye!',
	'Kal ka kaam aaj kar lo!',
	'Keyboard pe haath rakhne ka time!',
	'Phir se usi file pe aa gaye!',
	'Arrey, kahan gaye the itni der?',
	'Wahi se shuru karo jahan choda tha!',
	'README likhna mat bhoolna!',
	'Tests likhna mat bhoolna... please.',
	'Aaj sab green rahega!',
	'Code aur chai — perfect combo!',
	'Lo bhai, context hazir hai!',
];

function timeAgo(isoString: string): string {
	const diff = Date.now() - new Date(isoString).getTime();
	const mins = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);
	if (mins < 1) { return 'just now'; }
	if (mins < 60) { return `${mins}m ago`; }
	if (hours < 24) { return `${hours}h ago`; }
	if (days === 1) { return 'yesterday'; }
	return `${days} days ago`;
}

function getSessionsHtml(sessions: SessionData[], greeting: string): string {
	const commonStyles = `
		* { box-sizing: border-box; margin: 0; padding: 0; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			background: var(--vscode-sideBar-background);
			color: var(--vscode-foreground);
			padding: 16px;
			font-size: 13px;
		}
		.btn-primary {
			flex: 1;
			padding: 7px 0;
			font-size: 12px;
			font-weight: 500;
			cursor: pointer;
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 4px;
		}
		.btn-primary:hover { opacity: 0.85; }
		.btn-secondary {
			display: block;
			width: 100%;
			padding: 8px 0;
			font-size: 13px;
			font-weight: 500;
			cursor: pointer;
			background: transparent;
			color: var(--vscode-foreground);
			border: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.4));
			border-radius: 4px;
			margin-top: 8px;
		}
		.btn-secondary:hover { opacity: 0.7; }
		.btn-icon {
			padding: 7px 10px;
			font-size: 12px;
			cursor: pointer;
			background: transparent;
			color: var(--vscode-errorForeground, #f48771);
			border: 1px solid var(--vscode-errorForeground, #f48771);
			border-radius: 4px;
			opacity: 0.6;
		}
		.btn-icon:hover { opacity: 1; }
		textarea {
			width: 100%;
			background: var(--vscode-input-background);
			color: var(--vscode-input-foreground);
			border: 1px solid var(--vscode-input-border, rgba(128,128,128,0.3));
			border-radius: 4px;
			padding: 8px;
			font-size: 12px;
			font-family: inherit;
			resize: vertical;
			min-height: 60px;
			line-height: 1.5;
		}
		textarea:focus { outline: 1px solid var(--vscode-focusBorder); border-color: var(--vscode-focusBorder); }
	`;

	if (sessions.length === 0) {
		return `<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<style>
				${commonStyles}
				.empty {
					text-align: center;
					padding: 28px 0 16px;
					color: var(--vscode-descriptionForeground);
					font-size: 12px;
					line-height: 1.6;
				}
				.empty-icon { font-size: 28px; margin-bottom: 10px; }
				.empty-title { font-size: 14px; font-weight: 600; color: var(--vscode-foreground); margin-bottom: 4px; }
				.section-label {
					font-size: 10px;
					font-weight: 600;
					text-transform: uppercase;
					letter-spacing: 0.8px;
					color: var(--vscode-descriptionForeground);
					margin-bottom: 6px;
				}
			</style>
		</head>
		<body>
			<div class="empty">
				<div class="empty-icon">🙏</div>
				<div class="empty-title">Pehli baar aa gaye!</div>
				<div>Save your session so you can pick up right where you left off.</div>
			</div>
			<div class="section-label">Session name</div>
			<textarea id="note" placeholder="What are you working on? e.g. fixing login bug..."></textarea>
			<button class="btn-secondary" style="margin-top:8px" onclick="save()">💾 Save Session</button>
			<script>
				const vscode = acquireVsCodeApi();
				function save() {
					const note = document.getElementById('note').value;
					vscode.postMessage({ command: 'saveWithNote', note });
				}
			</script>
		</body>
		</html>`;
	}

	const sessionCards = sessions.map(session => {
		const ago = timeAgo(session.timestamp);
		const fileCount = session.openFiles.length;
		const activeFileName = session.activeFile ? session.activeFile.split('/').pop() : null;
		const activeLine = session.activeFile && session.cursorPositions[session.activeFile]
			? session.cursorPositions[session.activeFile].line + 1
			: null;
		const displayName = session.note || 'Unnamed session';

		return `
		<div class="session-card">
			<div class="session-name">${displayName}</div>
			<div class="session-meta">
				<span>🌿 ${session.branch}</span>
				<span class="dot">·</span>
				<span>${ago}</span>
			</div>
			<div class="session-files">
				📁 ${fileCount} file${fileCount !== 1 ? 's' : ''}${activeFileName ? ` &nbsp;·&nbsp; 🎯 ${activeFileName}${activeLine ? `:${activeLine}` : ''}` : ''}
			</div>
			<div class="session-actions">
				<button class="btn-primary" onclick="resume('${session.id}')">▶ Resume</button>
				<button class="btn-icon" onclick="deleteSession('${session.id}')" title="Delete session">🗑</button>
			</div>
		</div>`;
	}).join('');

	return `<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<style>
			${commonStyles}

			.greeting { font-size: 15px; font-weight: 600; margin-bottom: 14px; }

			.session-card {
				background: var(--vscode-textBlockQuote-background, rgba(128,128,128,0.08));
				border: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.15));
				border-radius: 6px;
				padding: 12px;
				margin-bottom: 10px;
			}
			.session-name {
				font-size: 13px;
				font-weight: 600;
				margin-bottom: 5px;
				color: var(--vscode-foreground);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.session-meta {
				font-size: 11px;
				color: var(--vscode-descriptionForeground);
				margin-bottom: 4px;
				display: flex;
				align-items: center;
				gap: 5px;
			}
			.session-files {
				font-size: 11px;
				color: var(--vscode-descriptionForeground);
				margin-bottom: 10px;
				font-family: 'Menlo', 'Monaco', monospace;
			}
			.session-actions {
				display: flex;
				gap: 6px;
				align-items: center;
			}
			.divider { height: 1px; background: var(--vscode-widget-border, rgba(128,128,128,0.2)); margin: 12px 0; }

			.save-form { display: none; }
			.save-form.visible { display: block; }
			.save-row { display: flex; gap: 6px; margin-top: 6px; }
			.save-row button { margin-top: 0; }
			.section-label {
				font-size: 10px;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 0.8px;
				color: var(--vscode-descriptionForeground);
				margin-bottom: 6px;
			}
		</style>
	</head>
	<body>
		<div class="greeting">${greeting}</div>

		${sessionCards}

		<div class="divider"></div>

		<button class="btn-secondary" onclick="showSaveForm()" id="saveBtn">+ Save New Session</button>

		<div class="save-form" id="saveForm">
			<div class="section-label" style="margin-top:8px">Session name</div>
			<textarea id="newNote" placeholder="What are you working on? e.g. fixing login bug..."></textarea>
			<div class="save-row">
				<button class="btn-primary" onclick="saveNew()">Save</button>
				<button class="btn-icon" style="color:var(--vscode-foreground);border-color:var(--vscode-widget-border)" onclick="hideSaveForm()">Cancel</button>
			</div>
		</div>

		<script>
			const vscode = acquireVsCodeApi();

			function resume(id) { vscode.postMessage({ command: 'resume', id }); }
			function deleteSession(id) { vscode.postMessage({ command: 'clearSession', id }); }

			function showSaveForm() {
				document.getElementById('saveForm').classList.add('visible');
				document.getElementById('saveBtn').style.display = 'none';
				document.getElementById('newNote').focus();
			}

			function hideSaveForm() {
				document.getElementById('saveForm').classList.remove('visible');
				document.getElementById('saveBtn').style.display = 'block';
			}

			function saveNew() {
				const note = document.getElementById('newNote').value;
				vscode.postMessage({ command: 'saveWithNote', note });
			}
		</script>
	</body>
	</html>`;
}

class KahanThaMainViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'kahanThaMain.sidebarView';
	private _view?: vscode.WebviewView;
	private _greeting: string = greetings[Math.floor(Math.random() * greetings.length)];

	constructor(private readonly _context: vscode.ExtensionContext) {}

	resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;
		webviewView.webview.options = { enableScripts: true };
		this._refresh();

		webviewView.webview.onDidReceiveMessage(async message => {
			if (message.command === 'saveWithNote') {
				await this._saveSession(message.note);
			}
			if (message.command === 'resume') {
				await this._resumeSession(message.id);
			}
			if (message.command === 'clearSession') {
				await this._clearSession(message.id);
			}
		});
	}

	private _getSessions(): SessionData[] {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) { return []; }
		const workspaceName = workspaceFolders[0].name;
		return this._context.globalState.get<SessionData[]>(`sessions-${workspaceName}`) ?? [];
	}

	private _refresh() {
		if (!this._view) { return; }
		this._view.webview.html = getSessionsHtml(this._getSessions(), this._greeting);
	}

	private async _saveSession(note?: string) {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace open.');
			return;
		}

		const workspacePath = workspaceFolders[0].uri.fsPath;
		const workspaceName = workspaceFolders[0].name;

		const openFiles = vscode.workspace.textDocuments
			.filter(doc => !doc.isUntitled && doc.uri.scheme === 'file')
			.map(doc => doc.uri.fsPath);

		const activeEditor = vscode.window.activeTextEditor;
		const activeFile = activeEditor ? activeEditor.document.uri.fsPath : null;

		const cursorPositions: { [file: string]: { line: number; character: number } } = {};
		if (activeEditor && activeFile) {
			cursorPositions[activeFile] = {
				line: activeEditor.selection.active.line,
				character: activeEditor.selection.active.character,
			};
		}

		const session: SessionData = {
			id: Date.now().toString(),
			workspace: workspaceName,
			branch: getGitBranch(workspacePath),
			openFiles,
			activeFile,
			cursorPositions,
			timestamp: new Date().toISOString(),
			note: note || '',
		};

		const sessions = this._getSessions();
		sessions.unshift(session);
		await this._context.globalState.update(`sessions-${workspaceName}`, sessions);
		vscode.window.showInformationMessage('Session saved! See you next time.');
		this._refresh();
	}

	private async _clearSession(id: string) {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) { return; }
		const workspaceName = workspaceFolders[0].name;
		const sessions = this._getSessions().filter(s => s.id !== id);
		await this._context.globalState.update(`sessions-${workspaceName}`, sessions);
		this._refresh();
	}

	private async _resumeSession(id: string) {
		const session = this._getSessions().find(s => s.id === id);
		if (!session) { return; }

		for (const filePath of session.openFiles) {
			try {
				const doc = await vscode.workspace.openTextDocument(filePath);
				const editor = await vscode.window.showTextDocument(doc, { preview: false });
				if (session.activeFile === filePath && session.cursorPositions[filePath]) {
					const pos = session.cursorPositions[filePath];
					const position = new vscode.Position(pos.line, pos.character);
					editor.selection = new vscode.Selection(position, position);
					editor.revealRange(new vscode.Range(position, position));
				}
			} catch {
				// file may have been deleted
			}
		}
	}

	public refresh() {
		this._refresh();
	}

	public async autoSave() {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) { return; }

		const workspacePath = workspaceFolders[0].uri.fsPath;
		const workspaceName = workspaceFolders[0].name;
		const sessions = this._getSessions();

		const openFiles = vscode.workspace.textDocuments
			.filter(doc => !doc.isUntitled && doc.uri.scheme === 'file')
			.map(doc => doc.uri.fsPath);

		if (openFiles.length === 0 && sessions.length === 0) { return; }

		const activeEditor = vscode.window.activeTextEditor;
		const activeFile = activeEditor ? activeEditor.document.uri.fsPath : null;

		if (sessions.length > 0) {
			const latest = sessions[0];
			if (activeEditor && activeFile) {
				latest.cursorPositions[activeFile] = {
					line: activeEditor.selection.active.line,
					character: activeEditor.selection.active.character,
				};
				latest.activeFile = activeFile;
			}
			if (openFiles.length > 0) {
				latest.openFiles = openFiles;
			}
			latest.branch = getGitBranch(workspacePath);
			latest.timestamp = new Date().toISOString();
			await this._context.globalState.update(`sessions-${workspaceName}`, sessions);
		} else {
			const cursorPositions: { [file: string]: { line: number; character: number } } = {};
			if (activeEditor && activeFile) {
				cursorPositions[activeFile] = {
					line: activeEditor.selection.active.line,
					character: activeEditor.selection.active.character,
				};
			}
			const session: SessionData = {
				id: Date.now().toString(),
				workspace: workspaceName,
				branch: getGitBranch(workspacePath),
				openFiles,
				activeFile,
				cursorPositions,
				timestamp: new Date().toISOString(),
				note: '',
			};
			await this._context.globalState.update(`sessions-${workspaceName}`, [session]);
		}
	}
}

let globalProvider: KahanThaMainViewProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
	const provider = new KahanThaMainViewProvider(context);
	globalProvider = provider;

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(KahanThaMainViewProvider.viewType, provider)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('kahan-tha-main.saveSession', () => {
			provider.refresh();
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(() => {
			provider.refresh();
		})
	);
}

export async function deactivate() {
	if (globalProvider) {
		await globalProvider.autoSave();
	}
}
