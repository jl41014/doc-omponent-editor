export interface AlignBoxConfig {
    showPreviews?: boolean;
    sanitizeHtml?: ( html: string ) => AlignBoxSanitizeOutput;
}

export interface AlignBoxSanitizeOutput {
	html: string;
	hasChanged: boolean;
}