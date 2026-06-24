import * as vscode from 'vscode';
import { execSync } from 'child_process';

interface SessionData {
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

function getSessionHtml(session: SessionData | undefined, webview: vscode.Webview): string {
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
			display: block;
			width: 100%;
			padding: 8px 0;
			font-size: 13px;
			font-weight: 500;
			cursor: pointer;
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 4px;
			margin-top: 8px;
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
			min-height: 70px;
			line-height: 1.5;
		}
		textarea:focus { outline: 1px solid var(--vscode-focusBorder); border-color: var(--vscode-focusBorder); }
	`;

	if (!session) {
		return `<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<style>
				${commonStyles}
				.empty {
					text-align: center;
					padding: 32px 0 20px;
					color: var(--vscode-descriptionForeground);
					font-size: 12px;
					line-height: 1.6;
				}
				.empty-icon { font-size: 28px; margin-bottom: 10px; }
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
				<div class="empty-icon">📍</div>
				<div>No session saved yet.</div>
				<div>What are you working on?</div>
			</div>
			<div class="section-label">Your note</div>
			<textarea id="note" placeholder="Describe your current task, findings, or next steps..."></textarea>
			<button class="btn-primary" onclick="save()">Save Session</button>
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

	const lastSaved = new Date(session.timestamp).toLocaleString();

	return `<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<style>
			${commonStyles}

			.greeting { font-size: 15px; font-weight: 600; margin-bottom: 2px; }
			.timestamp { font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 16px; }

			.section { margin-bottom: 14px; }
			.label {
				font-size: 10px;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 0.8px;
				color: var(--vscode-descriptionForeground);
				margin-bottom: 4px;
				display: flex;
				align-items: center;
				gap: 5px;
			}
			.value { font-size: 13px; line-height: 1.5; }

			.divider { height: 1px; background: var(--vscode-widget-border, rgba(128,128,128,0.2)); margin: 12px 0; }

			.edit-hint {
				font-size: 10px;
				color: var(--vscode-descriptionForeground);
				margin-top: 4px;
				display: none;
			}
			.task-display {
				background: var(--vscode-textBlockQuote-background, rgba(128,128,128,0.1));
				border-left: 2px solid var(--vscode-textLink-foreground);
				padding: 8px 10px;
				border-radius: 0 4px 4px 0;
				font-size: 12px;
				line-height: 1.6;
				cursor: pointer;
				min-height: 36px;
			}
			.task-display:hover { opacity: 0.8; }

			.files-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
			.files-list li {
				padding: 4px 8px;
				background: var(--vscode-textBlockQuote-background, rgba(128,128,128,0.08));
				border-radius: 3px;
				color: var(--vscode-textLink-foreground);
				font-family: 'Menlo', 'Monaco', monospace;
				font-size: 11px;
				display: flex;
				align-items: center;
				gap: 6px;
			}
			.active-file {
				font-family: 'Menlo', 'Monaco', monospace;
				font-size: 11px;
				color: var(--vscode-textLink-foreground);
			}
			.line-badge {
				display: inline-block;
				margin-left: 6px;
				padding: 1px 5px;
				background: var(--vscode-badge-background);
				color: var(--vscode-badge-foreground);
				border-radius: 8px;
				font-size: 10px;
			}
			.active-dot {
				display: inline-block;
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: var(--vscode-textLink-foreground);
				flex-shrink: 0;
			}
			.save-form { display: none; margin-top: 12px; }
			.save-form.visible { display: block; }
			.save-row { display: flex; gap: 6px; margin-top: 6px; }
			.save-row button { margin-top: 0; flex: 1; }
		</style>
	</head>
	<body>
		<div class="greeting">Welcome back.</div>
		<div class="timestamp">Last session · ${lastSaved}</div>

		<div class="section">
			<div class="label">📝 Task</div>
			<div class="task-display" id="taskDisplay" onclick="editTask()" title="Click to edit">${session.note || 'Click to add a note...'}</div>
			<div class="edit-hint" id="editHint">Click to edit your task note</div>
			<textarea id="taskEdit" style="display:none" placeholder="What are you working on?">${session.note || ''}</textarea>
			<div class="save-row" id="taskActions" style="display:none">
				<button class="btn-primary" onclick="saveTask()">Save Note</button>
				<button class="btn-secondary" onclick="cancelEdit()">Cancel</button>
			</div>
		</div>

		<div class="divider"></div>

		<div class="section">
			<div class="label">📁 Project</div>
			<div class="value">${session.workspace}</div>
		</div>

		<div class="section">
			<div class="label">🌿 Branch</div>
			<div class="value">${session.branch}</div>
		</div>

		${session.activeFile ? `
		<div class="section">
			<div class="label">🎯 Last Active File</div>
			<div class="active-file">
				${session.activeFile.split('/').pop()}
				${session.cursorPositions[session.activeFile] ? `<span class="line-badge">Line ${session.cursorPositions[session.activeFile].line + 1}</span>` : ''}
			</div>
		</div>
		` : ''}

		<div class="divider"></div>

		<div class="section">
			<div class="label">🗂 Open Files</div>
			<ul class="files-list">
				${session.openFiles.map(f => `
					<li>
						${f === session.activeFile ? '<span class="active-dot"></span>' : ''}
						${f.split('/').pop()}
					</li>
				`).join('')}
			</ul>
		</div>

		<div class="divider"></div>

		<button class="btn-primary" onclick="resume()">▶ Resume Session</button>

		<div class="save-form" id="saveForm">
			<div class="label" style="margin-bottom:6px">📝 New session note</div>
			<textarea id="newNote" placeholder="What are you working on now?"></textarea>
			<div class="save-row">
				<button class="btn-primary" onclick="saveNew()">Save</button>
				<button class="btn-secondary" onclick="hideSaveForm()">Cancel</button>
			</div>
		</div>

		<button class="btn-secondary" onclick="showSaveForm()" id="saveBtn">💾 Save New Session</button>

		<script>
			const vscode = acquireVsCodeApi();

			function resume() { vscode.postMessage({ command: 'resume' }); }

			function editTask() {
				document.getElementById('taskDisplay').style.display = 'none';
				document.getElementById('taskEdit').style.display = 'block';
				document.getElementById('taskActions').style.display = 'flex';
				document.getElementById('taskEdit').focus();
			}

			function cancelEdit() {
				document.getElementById('taskDisplay').style.display = 'block';
				document.getElementById('taskEdit').style.display = 'none';
				document.getElementById('taskActions').style.display = 'none';
			}

			function saveTask() {
				const note = document.getElementById('taskEdit').value;
				document.getElementById('taskDisplay').textContent = note || 'Click to add a note...';
				cancelEdit();
				vscode.postMessage({ command: 'updateNote', note });
			}

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

class WhereWasIViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'whereWasI.sidebarView';
	private _view?: vscode.WebviewView;

	constructor(private readonly _context: vscode.ExtensionContext) {}

	resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;
		webviewView.webview.options = { enableScripts: true };
		this._refresh();

		webviewView.webview.onDidReceiveMessage(async message => {
			if (message.command === 'saveWithNote') {
				await this._saveSession(message.note);
			}
			if (message.command === 'updateNote') {
				await this._updateNote(message.note);
			}
			if (message.command === 'resume') {
				await this._resumeSession();
			}
		});
	}

	private _getSession(): SessionData | undefined {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) { return undefined; }
		const workspaceName = workspaceFolders[0].name;
		return this._context.globalState.get<SessionData>(`session-${workspaceName}`);
	}

	private _refresh() {
		if (!this._view) { return; }
		const session = this._getSession();
		this._view.webview.html = getSessionHtml(session, this._view.webview);
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
			workspace: workspaceName,
			branch: getGitBranch(workspacePath),
			openFiles,
			activeFile,
			cursorPositions,
			timestamp: new Date().toISOString(),
			note: note || '',
		};

		await this._context.globalState.update(`session-${workspaceName}`, session);
		vscode.window.showInformationMessage('Session saved! See you next time.');
		this._refresh();
	}

	private async _updateNote(note: string) {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) { return; }
		const workspaceName = workspaceFolders[0].name;
		const session = this._context.globalState.get<SessionData>(`session-${workspaceName}`);
		if (!session) { return; }
		session.note = note;
		await this._context.globalState.update(`session-${workspaceName}`, session);
	}

	private async _resumeSession() {
		const session = this._getSession();
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
}

export function activate(context: vscode.ExtensionContext) {
	const provider = new WhereWasIViewProvider(context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WhereWasIViewProvider.viewType, provider)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('where-was-i.saveSession', () => {
			provider.refresh();
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(() => {
			provider.refresh();
		})
	);
}

export function deactivate() {}
